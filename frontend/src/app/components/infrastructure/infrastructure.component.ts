import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { InfrastructureService, InfrastructureData } from '../../services/infrastructure.service';
import { Subscription } from 'rxjs';

interface InfrastructureNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'router' | 'server' | 'workstation' | string;
  status: 'normal' | 'warning' | 'critical' | string;
  ipAddress?: string;
  metadata?: Record<string, string | number | boolean>;
}

interface InfrastructureLink extends d3.SimulationLinkDatum<InfrastructureNode> {
  id: string;
  source: string | InfrastructureNode;
  target: string | InfrastructureNode;
  status: 'normal' | 'warning' | 'critical' | string;
  protocol?: string;
  ports?: string[];
}

interface ConnectionData {
  id: string;
  source: string;
  target: string;
  status: string;
  protocol?: string;
  ports?: string[];
}

@Component({
  selector: 'app-infrastructure',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="infrastructure-container">
      <header class="infrastructure-header">
        <h1>Infrastruktur</h1>
        <div class="header-actions">
          <div class="search-container">
            <i class="bi bi-search"></i>
            <input
              type="text"
              placeholder="Suche nach Ressourcen..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
            />
          </div>
          <select class="view-selector">
            <option>Netzwerkansicht</option>
            <option>Listenansicht</option>
            <option>Gruppenansicht</option>
          </select>
          <button class="import-button">
            <i class="bi bi-cloud-upload"></i>
            Importieren
          </button>
          <button class="sync-button">
            <i class="bi bi-arrow-repeat"></i>
            Synchronisieren
          </button>
        </div>
      </header>

      <div class="content-container">
        <div class="sidebar">
          <div class="sidebar-section">
            <h3>Filter</h3>
            <div class="filter-group">
              <label>Typ</label>
              <div class="checkbox-list">
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="filter-type-router"
                    [checked]="filters.types.router"
                    (change)="toggleFilter('type', 'router')"
                  />
                  <label for="filter-type-router">Router</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="filter-type-server"
                    [checked]="filters.types.server"
                    (change)="toggleFilter('type', 'server')"
                  />
                  <label for="filter-type-server">Server</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="filter-type-workstation"
                    [checked]="filters.types.workstation"
                    (change)="toggleFilter('type', 'workstation')"
                  />
                  <label for="filter-type-workstation">Workstation</label>
                </div>
              </div>
            </div>
            <div class="filter-group">
              <label>Status</label>
              <div class="checkbox-list">
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="filter-status-normal"
                    [checked]="filters.statuses.normal"
                    (change)="toggleFilter('status', 'normal')"
                  />
                  <label for="filter-status-normal">Normal</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="filter-status-warning"
                    [checked]="filters.statuses.warning"
                    (change)="toggleFilter('status', 'warning')"
                  />
                  <label for="filter-status-warning">Warnung</label>
                </div>
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    id="filter-status-critical"
                    [checked]="filters.statuses.critical"
                    (change)="toggleFilter('status', 'critical')"
                  />
                  <label for="filter-status-critical">Kritisch</label>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Legende</h3>
            <div class="legend-item">
              <div class="legend-icon router"></div>
              <span>Router</span>
            </div>
            <div class="legend-item">
              <div class="legend-icon server"></div>
              <span>Server</span>
            </div>
            <div class="legend-item">
              <div class="legend-icon workstation"></div>
              <span>Workstation</span>
            </div>
            <div class="legend-item">
              <div class="status-dot normal"></div>
              <span>Normal</span>
            </div>
            <div class="legend-item">
              <div class="status-dot warning"></div>
              <span>Warnung</span>
            </div>
            <div class="legend-item">
              <div class="status-dot critical"></div>
              <span>Kritisch</span>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Details</h3>
            <div class="detail-info">
              <p class="empty-selection" *ngIf="!selectedNode">
                Wählen Sie eine Ressource aus, um Details anzuzeigen.
              </p>
              <div class="selected-resource-details" *ngIf="selectedNode">
                <h4>{{ selectedNode.name }}</h4>
                <div class="detail-item">
                  <span class="label">Typ:</span>
                  <span class="value">{{ capitalizeFirstLetter(selectedNode.type) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span
                    class="value"
                    [ngClass]="{
                      'text-warning': selectedNode.status === 'warning',
                      'text-critical': selectedNode.status === 'critical',
                    }"
                  >
                    {{ capitalizeFirstLetter(selectedNode.status) }}
                  </span>
                </div>
                <div class="detail-item" *ngIf="selectedNode.ipAddress">
                  <span class="label">IP-Adresse:</span>
                  <span class="value">{{ selectedNode.ipAddress }}</span>
                </div>
                <div class="detail-item" *ngFor="let item of getNodeMetadataEntries()">
                  <span class="label">{{ item.key }}:</span>
                  <span class="value">{{ item.value }}</span>
                </div>
                <button class="action-button">
                  <i class="bi bi-shield-lock"></i>
                  Schwachstellen scannen
                </button>
                <button class="action-button">
                  <i class="bi bi-gear"></i>
                  Konfiguration anzeigen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="graph-container">
          <div class="graph-controls">
            <button class="control-button" (click)="zoomIn()">
              <i class="bi bi-zoom-in"></i>
            </button>
            <button class="control-button" (click)="zoomOut()">
              <i class="bi bi-zoom-out"></i>
            </button>
            <button class="control-button" (click)="resetZoom()">
              <i class="bi bi-arrows-fullscreen"></i>
            </button>
          </div>
          <div #networkGraph class="network-graph"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .infrastructure-container {
        padding: 24px;
        color: #e4e6eb;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .infrastructure-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .infrastructure-header h1 {
        font-size: 28px;
        font-weight: 500;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .search-container {
        position: relative;
      }

      .search-container i {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #a8a8a8;
      }

      .search-container input {
        padding: 8px 8px 8px 32px;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 4px;
        color: #e4e6eb;
        font-size: 14px;
        outline: none;
        width: 250px;
      }

      .view-selector {
        padding: 8px 12px;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 4px;
        color: #e4e6eb;
        font-size: 14px;
        outline: none;
      }

      .import-button,
      .sync-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #333;
        color: #e4e6eb;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .import-button:hover,
      .sync-button:hover {
        background-color: #444;
      }

      .content-container {
        display: flex;
        flex: 1;
        gap: 24px;
        min-height: 0;
      }

      .sidebar {
        width: 280px;
        flex-shrink: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .sidebar-section {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 16px;
      }

      .sidebar-section h3 {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 12px 0;
        color: #e4e6eb;
      }

      .filter-group {
        margin-bottom: 16px;
      }

      .filter-group:last-child {
        margin-bottom: 0;
      }

      .filter-group label {
        display: block;
        font-size: 14px;
        margin-bottom: 8px;
        color: #a8a8a8;
      }

      .checkbox-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .checkbox-item input {
        cursor: pointer;
      }

      .checkbox-item label {
        font-size: 14px;
        margin-bottom: 0;
        cursor: pointer;
        color: #e4e6eb;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .legend-icon {
        width: 20px;
        height: 20px;
        border-radius: 5px;
        background-color: #333;
      }

      .legend-icon.router {
        background-color: #3b82f6;
      }

      .legend-icon.server {
        background-color: #10b981;
      }

      .legend-icon.workstation {
        background-color: #a78bfa;
      }

      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .status-dot.normal {
        background-color: #10b981;
      }

      .status-dot.warning {
        background-color: #f59e0b;
      }

      .status-dot.critical {
        background-color: #ef4444;
      }

      .detail-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .empty-selection {
        color: #a8a8a8;
        font-style: italic;
        margin: 0;
      }

      .selected-resource-details h4 {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 12px 0;
        color: #e4e6eb;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .detail-item .label {
        color: #a8a8a8;
      }

      .detail-item .value {
        color: #e4e6eb;
        font-weight: 500;
      }

      .text-warning {
        color: #f59e0b;
      }

      .text-critical {
        color: #ef4444;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        margin-top: 12px;
        transition: background-color 0.2s;
        width: 100%;
      }

      .action-button:hover {
        background-color: #2563eb;
      }

      .action-button:last-child {
        background-color: #333;
        color: #e4e6eb;
      }

      .action-button:last-child:hover {
        background-color: #444;
      }

      .graph-container {
        flex: 1;
        background-color: #1e1e1e;
        border-radius: 8px;
        position: relative;
        overflow: hidden;
      }

      .graph-controls {
        position: absolute;
        top: 16px;
        right: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 10;
      }

      .control-button {
        width: 32px;
        height: 32px;
        background-color: rgba(26, 26, 26, 0.8);
        border: 1px solid #555;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e4e6eb;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .control-button:hover {
        background-color: rgba(51, 51, 51, 0.8);
      }

      .network-graph {
        width: 100%;
        height: 100%;
      }

      /* D3.js Styling */
      :host ::ng-deep .node {
        cursor: pointer;
      }

      :host ::ng-deep .node:hover {
        filter: brightness(1.2);
      }

      :host ::ng-deep .node-selected {
        stroke: #fff;
        stroke-width: 2px;
      }

      :host ::ng-deep .link {
        stroke: #555;
        stroke-opacity: 0.6;
      }

      :host ::ng-deep .link-normal {
        stroke: #a8a8a8;
      }

      :host ::ng-deep .link-warning {
        stroke: #f59e0b;
      }

      :host ::ng-deep .link-critical {
        stroke: #ef4444;
      }

      :host ::ng-deep .node-label {
        font-size: 12px;
        fill: #e4e6eb;
        pointer-events: none;
        text-anchor: middle;
      }

      @media (max-width: 1024px) {
        .content-container {
          flex-direction: column;
        }

        .sidebar {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .graph-container {
          height: 500px;
        }
      }

      @media (max-width: 768px) {
        .infrastructure-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .header-actions {
          flex-wrap: wrap;
          width: 100%;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class InfrastructureComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('networkGraph') networkGraphElement!: ElementRef;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private simulation!: d3.Simulation<
    InfrastructureNode,
    d3.SimulationLinkDatum<InfrastructureNode>
  >;
  private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private zoomGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private nodes: InfrastructureNode[] = [];
  private links: InfrastructureLink[] = [];
  private allNodes: InfrastructureNode[] = [];
  private allLinks: InfrastructureLink[] = [];
  private subscription: Subscription | null = null;

  searchQuery = '';
  selectedNode: InfrastructureNode | null = null;
  filters = {
    types: {
      router: true,
      server: true,
      workstation: true,
    },
    statuses: {
      normal: true,
      warning: true,
      critical: true,
    },
  };

  constructor(private infrastructureService: InfrastructureService) {}

  ngOnInit(): void {
    this.subscription = this.infrastructureService.getInfrastructureData().subscribe(
      (data: InfrastructureData) => {
        this.allNodes = data.nodes as InfrastructureNode[];
        this.allLinks = data.connections.map((connection: ConnectionData) => ({
          id: connection.id,
          source: connection.source,
          target: connection.target,
          status: connection.status,
          protocol: connection.protocol,
          ports: connection.ports,
        }));

        this.applyFilters();
      },
      (error: Error) => {
        console.error('Failed to load infrastructure data:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeVisualization();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.simulation) {
      this.simulation.stop();
    }
  }

  initializeVisualization(): void {
    const element = this.networkGraphElement.nativeElement;
    const width = element.clientWidth;
    const height = element.clientHeight;

    // Create SVG
    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);

    // Add zoom behavior
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // Cast transform to any to avoid TypeScript error
        this.zoomGroup.attr('transform', event.transform as any);
      });

    this.svg.call(this.zoom);

    // Create a group for zoom transforms
    this.zoomGroup = this.svg.append('g');

    // Initialize simulation
    this.simulation = d3
      .forceSimulation<InfrastructureNode>()
      .force(
        'link',
        d3
          .forceLink<InfrastructureNode, d3.SimulationLinkDatum<InfrastructureNode>>()
          .id((d: InfrastructureNode) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    this.updateVisualization();
  }

  updateVisualization(): void {
    if (!this.svg || !this.zoomGroup || this.nodes.length === 0) {
      return;
    }

    // Create links
    const link = this.zoomGroup
      .selectAll<SVGLineElement, InfrastructureLink>('.link')
      .data(this.links, (d: InfrastructureLink) => d.id)
      .join(
        enter =>
          enter
            .append('line')
            .attr('class', d => `link link-${d.status}`)
            .attr('stroke-width', 2),
        update => update.attr('class', d => `link link-${d.status}`),
        exit => exit.remove()
      );

    // Create nodes
    const node = this.zoomGroup
      .selectAll<SVGGElement, InfrastructureNode>('.node')
      .data(this.nodes, (d: InfrastructureNode) => d.id)
      .join(
        enter => {
          const nodeGroup = enter
            .append('g')
            .attr('class', 'node')
            .call(this.drag(this.simulation))
            .on('click', (event: MouseEvent, d: InfrastructureNode) => this.selectNode(d));

          // Add circle
          nodeGroup
            .append('circle')
            .attr('r', 20)
            .attr('fill', d => this.getNodeColor(d))
            .attr('class', d => `node-circle node-status-${d.status}`);

          // Add icon
          nodeGroup
            .append('text')
            .attr('class', 'node-icon')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('fill', 'white')
            .style('font-family', 'bootstrap-icons')
            .style('font-size', '16px')
            .text(d => this.getNodeIcon(d));

          // Add label
          nodeGroup
            .append('text')
            .attr('class', 'node-label')
            .attr('dy', '30')
            .text(d => d.name);

          return nodeGroup;
        },
        update => {
          update
            .select('circle')
            .attr('fill', d => this.getNodeColor(d))
            .attr('class', d => `node-circle node-status-${d.status}`);

          update.select('.node-icon').text(d => this.getNodeIcon(d));

          update.select('.node-label').text(d => d.name);

          return update;
        },
        exit => exit.remove()
      );

    // Update simulation
    this.simulation.nodes(this.nodes).on('tick', () => {
      link
        .attr('x1', d => (d.source as InfrastructureNode).x || 0)
        .attr('y1', d => (d.source as InfrastructureNode).y || 0)
        .attr('x2', d => (d.target as InfrastructureNode).x || 0)
        .attr('y2', d => (d.target as InfrastructureNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Type assertion for force link
    const linkForce = this.simulation.force('link') as d3.ForceLink<
      InfrastructureNode,
      d3.SimulationLinkDatum<InfrastructureNode>
    >;
    if (linkForce) {
      linkForce.links(this.links);
    }

    this.simulation.alpha(1).restart();
  }

  getNodeColor(node: InfrastructureNode): string {
    switch (node.type) {
      case 'router':
        return '#3b82f6'; // Blue
      case 'server':
        return '#10b981'; // Green
      case 'workstation':
        return '#a78bfa'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  }

  getNodeIcon(node: InfrastructureNode): string {
    switch (node.type) {
      case 'router':
        return '\uf5a0'; // bi-router
      case 'server':
        return '\uf5b7'; // bi-server
      case 'workstation':
        return '\uf5fc'; // bi-pc-display
      default:
        return '\uf5df'; // bi-question-circle
    }
  }

  drag(
    simulation: d3.Simulation<InfrastructureNode, d3.SimulationLinkDatum<InfrastructureNode>>
  ): d3.DragBehavior<SVGGElement, InfrastructureNode, unknown> {
    function dragstarted(event: d3.D3DragEvent<SVGGElement, InfrastructureNode, unknown>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      const subject = event.subject as InfrastructureNode;
      subject.fx = subject.x;
      subject.fy = subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, InfrastructureNode, unknown>) {
      const subject = event.subject as InfrastructureNode;
      subject.fx = event.x;
      subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, InfrastructureNode, unknown>) {
      if (!event.active) simulation.alphaTarget(0);
      const subject = event.subject as InfrastructureNode;
      subject.fx = null;
      subject.fy = null;
    }

    return d3
      .drag<SVGGElement, InfrastructureNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  selectNode(node: InfrastructureNode): void {
    this.selectedNode = node;

    // Update node highlighting
    this.zoomGroup.selectAll('.node-selected').classed('node-selected', false);
    this.zoomGroup
      .selectAll<SVGGElement, InfrastructureNode>('.node')
      .filter((d: InfrastructureNode) => d.id === node.id)
      .select('circle')
      .classed('node-selected', true);
  }

  zoomIn(): void {
    if (this.svg && this.zoom) {
      this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3);
    }
  }

  zoomOut(): void {
    if (this.svg && this.zoom) {
      this.svg
        .transition()
        .duration(300)
        .call(this.zoom.scaleBy, 1 / 1.3);
    }
  }

  resetZoom(): void {
    if (!this.svg || !this.zoom) return;

    // Use a function wrapper to call zoom.transform to satisfy TypeScript typing
    (this.zoomGroup as any)
      .transition()
      .duration(300)
      .call((selection: any) => this.zoom.transform(selection, d3.zoomIdentity));
  }

  toggleFilter(type: 'type' | 'status', value: string): void {
    if (type === 'type') {
      this.filters.types[value as keyof typeof this.filters.types] =
        !this.filters.types[value as keyof typeof this.filters.types];
    } else {
      this.filters.statuses[value as keyof typeof this.filters.statuses] =
        !this.filters.statuses[value as keyof typeof this.filters.statuses];
    }

    this.applyFilters();
  }

  onSearchChange(): void {
    // Debounce is handled in a real app using RxJS streams
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    // Filter nodes based on search query and checkbox filters
    this.nodes = this.allNodes.filter(node => {
      // Check if node type is selected in filters
      const typeMatch =
        (node.type === 'router' && this.filters.types.router) ||
        (node.type === 'server' && this.filters.types.server) ||
        (node.type === 'workstation' && this.filters.types.workstation);

      // Check if node status is selected in filters
      const statusMatch =
        (node.status === 'normal' && this.filters.statuses.normal) ||
        (node.status === 'warning' && this.filters.statuses.warning) ||
        (node.status === 'critical' && this.filters.statuses.critical);

      // Check if node name matches search query
      const searchMatch =
        this.searchQuery === '' || node.name.toLowerCase().includes(this.searchQuery.toLowerCase());

      return typeMatch && statusMatch && searchMatch;
    });

    // Filter links to only include connections between visible nodes
    const nodeIds = new Set(this.nodes.map(node => node.id));
    this.links = this.allLinks.filter(link => {
      // Get source and target IDs, which might be either strings or objects
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    if (this.svg) {
      this.updateVisualization();
    }
  }

  getNodeMetadataEntries(): { key: string; value: string }[] {
    if (!this.selectedNode || !this.selectedNode.metadata) {
      return [];
    }

    if (typeof this.selectedNode.metadata !== 'object') {
      return [];
    }

    return Object.entries(this.selectedNode.metadata).map(([key, value]) => ({
      key: this.capitalizeFirstLetter(key),
      value: String(value),
    }));
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
