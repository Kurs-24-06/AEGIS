import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InfrastructureService,
  InfrastructureData,
  InfrastructureNode,
  Connection
} from '../../services/infrastructure.service';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface Filters {
  showNormal: boolean;
  showWarning: boolean;
  showCritical: boolean;
  showRouters: boolean;
  showServers: boolean;
  showWorkstations: boolean;
}

@Component({
  selector: 'app-infrastructure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="infrastructure-container">
      <header class="infrastructure-header">
        <h1>Infrastruktur-Visualisierung</h1>
        <div class="controls">
          <button class="btn" (click)="zoomIn()">
            <i class="bi bi-zoom-in"></i>
          </button>
          <button class="btn" (click)="zoomOut()">
            <i class="bi bi-zoom-out"></i>
          </button>
          <button class="btn" (click)="resetZoom()">
            <i class="bi bi-arrows-fullscreen"></i>
          </button>
          <select class="layout-select" [(ngModel)]="selectedLayout" (change)="changeLayout()">
            <option value="force">Kraft-basiertes Layout</option>
            <option value="radial">Radiales Layout</option>
            <option value="hierarchical">Hierarchisches Layout</option>
          </select>
        </div>
      </header>

      <div class="infrastructure-content">
        <div class="sidebar">
          <div class="search-box">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Ressourcen suchen..."
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
            >
          </div>

          <div class="filter-section">
            <h3>Filter</h3>
            <div class="filter-group">
              <div class="checkbox">
                <input type="checkbox" id="show-normal" [checked]="filters.showNormal" (change)="toggleFilter('showNormal')">
                <label for="show-normal">
                  <span class="status-dot normal"></span>
                  Normal
                </label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="show-warning" [checked]="filters.showWarning" (change)="toggleFilter('showWarning')">
                <label for="show-warning">
                  <span class="status-dot warning"></span>
                  Warnung
                </label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="show-critical" [checked]="filters.showCritical" (change)="toggleFilter('showCritical')">
                <label for="show-critical">
                  <span class="status-dot critical"></span>
                  Kritisch
                </label>
              </div>
            </div>

            <div class="filter-group">
              <div class="checkbox">
                <input type="checkbox" id="show-routers" [checked]="filters.showRouters" (change)="toggleFilter('showRouters')">
                <label for="show-routers">
                  <i class="bi bi-hdd-network"></i>
                  Router
                </label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="show-servers" [checked]="filters.showServers" (change)="toggleFilter('showServers')">
                <label for="show-servers">
                  <i class="bi bi-server"></i>
                  Server
                </label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="show-workstations" [checked]="filters.showWorkstations" (change)="toggleFilter('showWorkstations')">
                <label for="show-workstations">
                  <i class="bi bi-pc-display"></i>
                  Workstations
                </label>
              </div>
            </div>
          </div>

          <div class="node-list">
            <h3>Ressourcen</h3>
            <div class="list-container">
              <div
                *ngFor="let node of filteredNodes"
                class="node-item"
                [ngClass]="node.status"
                (click)="selectNode(node)"
                [class.selected]="selectedNode?.id === node.id"
              >
                <i class="bi" [ngClass]="getNodeIcon(node.type)"></i>
                <div class="node-details">
                  <div class="node-name">{{ node.name }}</div>
                  <div class="node-ip" *ngIf="node.ipAddress">{{ node.ipAddress }}</div>
                </div>
                <span class="status-indicator" [ngClass]="node.status"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="visualization-container">
          <div #graphContainer class="graph-container"></div>

          <div class="details-panel" *ngIf="selectedNode">
            <div class="panel-header">
              <h3>{{ selectedNode.name }}</h3>
              <button class="close-btn" (click)="selectedNode = null">
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div class="panel-content">
              <div class="detail-item">
                <span class="label">Typ:</span>
                <span class="value">{{ getNodeTypeLabel(selectedNode.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value" [ngClass]="'text-' + selectedNode.status">
                  {{ getStatusLabel(selectedNode.status) }}
                </span>
              </div>
              <div class="detail-item" *ngIf="selectedNode.ipAddress">
                <span class="label">IP-Adresse:</span>
                <span class="value">{{ selectedNode.ipAddress }}</span>
              </div>

              <div class="connections">
                <h4>Verbindungen</h4>
                <div class="connection-list">
                  <div class="connection-item" *ngFor="let conn of getNodeConnections(selectedNode.id)">
                    <i class="bi bi-arrow-right"></i>
                    <div class="connection-details">
                      <div class="connection-target">
                        {{ getNodeName(conn.target === selectedNode.id ? conn.source : conn.target) }}
                      </div>
                      <div class="connection-info" *ngIf="conn.protocol || conn.ports">
                        {{ conn.protocol }} {{ conn.ports?.join(', ') }}
                      </div>
                    </div>
                    <span class="status-indicator" [ngClass]="conn.status"></span>
                  </div>
                </div>
              </div>

              <div class="actions">
                <button class="btn">Details anzeigen</button>
                <button class="btn">Konfigurieren</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .infrastructure-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .infrastructure-header {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #333;
    }

    .infrastructure-header h1 {
      margin: 0;
      font-size: 24px;
      color: #e4e6eb;
    }

    .controls {
      display: flex;
      gap: 8px;
    }

    .btn {
      background-color: #1e1e1e;
      border: 1px solid #333;
      color: #e4e6eb;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }

    .btn:hover {
      background-color: #2a2a2a;
    }

    .layout-select {
      background-color: #1e1e1e;
      color: #e4e6eb;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
    }

    .infrastructure-content {
      display: flex;
      flex-grow: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 280px;
      border-right: 1px solid #333;
      display: flex;
      flex-direction: column;
      background-color: #1a1a1a;
    }

    .search-box {
      padding: 16px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 24px;
      top: 24px;
      color: #6b7280;
    }

    .search-box input {
      width: 100%;
      padding: 8px 8px 8px 32px;
      background-color: #262626;
      border: 1px solid #333;
      border-radius: 4px;
      color: #e4e6eb;
      font-size: 14px;
    }

    .search-box input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .filter-section {
      padding: 0 16px 16px;
      border-bottom: 1px solid #333;
    }

    .filter-section h3 {
      font-size: 16px;
      color: #e4e6eb;
      margin: 0 0 12px 0;
    }

    .filter-group {
      margin-bottom: 12px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .checkbox input {
      margin-right: 8px;
    }

    .checkbox label {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #a8a8a8;
      cursor: pointer;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
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

    .checkbox i {
      margin-right: 8px;
      color: #6b7280;
    }

    .node-list {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
      overflow: hidden;
    }

    .node-list h3 {
      font-size: 16px;
      color: #e4e6eb;
      margin: 0 0 12px 0;
    }

    .list-container {
      overflow-y: auto;
      flex-grow: 1;
    }

    .node-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: background-color 0.2s;
    }

    .node-item:hover {
      background-color: #262626;
    }

    .node-item.selected {
      background-color: rgba(59, 130, 246, 0.1);
    }

    .node-item i {
      font-size: 18px;
      margin-right: 12px;
      color: #6b7280;
    }

    .node-details {
      flex-grow: 1;
    }

    .node-name {
      font-size: 14px;
      color: #e4e6eb;
    }

    .node-ip {
      font-size: 12px;
      color: #6b7280;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.normal {
      background-color: #10b981;
    }

    .status-indicator.warning {
      background-color: #f59e0b;
    }

    .status-indicator.critical {
      background-color: #ef4444;
    }

    .node-item.normal i {
      color: #10b981;
    }

    .node-item.warning i {
      color: #f59e0b;
    }

    .node-item.critical i {
      color: #ef4444;
    }

    .visualization-container {
      flex-grow: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    .graph-container {
      width: 100%;
      height: 100%;
      background-color: #121212;
    }

    .details-panel {
      position: absolute;
      right: 16px;
      top: 16px;
      width: 320px;
      background-color: #1e1e1e;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .panel-header {
      padding: 12px 16px;
      background-color: #262626;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      color: #e4e6eb;
    }

    .close-btn {
      background: none;
      border: none;
      color: #a8a8a8;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
    }

    .close-btn:hover {
      color: #e4e6eb;
    }

    .panel-content {
      padding: 16px;
    }

    .detail-item {
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }

    .detail-item .label {
      color: #a8a8a8;
      font-size: 14px;
    }

    .detail-item .value {
      color: #e4e6eb;
      font-size: 14px;
      font-weight: 500;
    }

    .text-normal {
      color: #10b981;
    }

    .text-warning {
      color: #f59e0b;
    }

    .text-critical {
      color: #ef4444;
    }

    .connections h4 {
      font-size: 15px;
      color: #e4e6eb;
      margin: 16px 0 8px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }

    .connection-list {
      max-height: 150px;
      overflow-y: auto;
    }

    .connection-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #262626;
    }

    .connection-item:last-child {
      border-bottom: none;
    }

    .connection-item i {
      font-size: 14px;
      color: #6b7280;
      margin-right: 8px;
    }

    .connection-details {
      flex-grow: 1;
    }

    .connection-target {
      font-size: 14px;
      color: #e4e6eb;
    }

    .connection-info {
      font-size: 12px;
      color: #6b7280;
    }

    .actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }

    .actions .btn {
      flex: 1;
    }
