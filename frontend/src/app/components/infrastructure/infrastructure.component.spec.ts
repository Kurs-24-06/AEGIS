import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { InfrastructureComponent } from './infrastructure.component';
import {
  InfrastructureService,
  InfrastructureData,
  InfrastructureNode,
  Connection,
} from '../../services/infrastructure.service';
import { Subject, throwError } from 'rxjs';

describe('InfrastructureComponent', () => {
  let component: InfrastructureComponent;
  let fixture: ComponentFixture<InfrastructureComponent>;
  let infrastructureServiceSpy: jasmine.SpyObj<InfrastructureService>;
  let infrastructureDataSubject: Subject<InfrastructureData>;

  const mockData: InfrastructureData = {
    nodes: [
      {
        id: '1',
        name: 'Router 1',
        type: 'router' as InfrastructureNode['type'],
        status: 'normal' as Connection['status'],
        metadata: {},
        ipAddress: '192.168.1.1',
      },
      {
        id: '2',
        name: 'Server 1',
        type: 'server' as InfrastructureNode['type'],
        status: 'warning' as Connection['status'],
        metadata: {},
        ipAddress: '192.168.1.2',
      },
    ],
    connections: [
      {
        id: 'c1',
        source: '1',
        target: '2',
        status: 'normal' as Connection['status'],
        protocol: 'TCP',
        ports: ['80', '443'],
      },
    ],
  };

  beforeEach(() => {
    infrastructureDataSubject = new Subject<InfrastructureData>();
    infrastructureServiceSpy = jasmine.createSpyObj('InfrastructureService', [
      'getInfrastructureData',
    ]);
    infrastructureServiceSpy.getInfrastructureData.and.returnValue(
      infrastructureDataSubject.asObservable()
    );

    TestBed.configureTestingModule({
      imports: [InfrastructureComponent, RouterTestingModule],
      providers: [
        { provide: InfrastructureService, useValue: infrastructureServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfrastructureComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to infrastructure data on init and update nodes and links', fakeAsync(() => {
    fixture.detectChanges();
    infrastructureDataSubject.next(mockData);
    tick();
    expect((component as any)['nodes'].length).toBe(2);
    expect((component as any)['links'].length).toBe(1);
  }));

  it('should handle error on infrastructure data subscription', fakeAsync(() => {
    spyOn(console, 'error');
    infrastructureServiceSpy.getInfrastructureData.and.returnValue(
      throwError(() => new Error('Test error'))
    );
    fixture = TestBed.createComponent(InfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    expect(console.error).toHaveBeenCalledWith(
      'Failed to load infrastructure data:',
      jasmine.any(Error)
    );
  }));

  it('should initialize D3 visualization after view init', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'initializeVisualization').and.callThrough();
    component.ngAfterViewInit();
    tick();
    expect(component.initializeVisualization).toHaveBeenCalled();
  }));

  it('should select a node and update selectedNode', () => {
    (component as any)['nodes'] = mockData.nodes;
    (component as any)['links'] = mockData.connections.map(c => ({
      id: c.id,
      source: c.source,
      target: c.target,
      status: c.status,
      protocol: c.protocol,
      ports: c.ports,
    }));
    fixture.detectChanges();

    component.selectNode(mockData.nodes[0]);
    expect(component.selectedNode).toEqual(mockData.nodes[0]);
  });

  it('should capitalize first letter correctly', () => {
    expect(component.capitalizeFirstLetter('test')).toBe('Test');
    expect(component.capitalizeFirstLetter('')).toBe('');
    expect(component.capitalizeFirstLetter(null as any)).toBe('');
  });

  it('should return correct node color', () => {
    expect(
      component.getNodeColor({
        id: '1',
        name: 'Router 1',
        type: 'router',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.1',
      })
    ).toBe('#3b82f6');
    expect(
      component.getNodeColor({
        id: '2',
        name: 'Server 1',
        type: 'server',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.2',
      })
    ).toBe('#10b981');
    expect(
      component.getNodeColor({
        id: '3',
        name: 'Workstation 1',
        type: 'workstation',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.3',
      })
    ).toBe('#a78bfa');
    expect(
      component.getNodeColor({
        id: '4',
        name: 'Unknown 1',
        type: 'unknown',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.4',
      })
    ).toBe('#6b7280');
    expect(
      component.getNodeColor({
        id: '5',
        name: 'Router 2',
        type: 'router',
        status: 'warning',
        metadata: {},
        ipAddress: '192.168.1.5',
      })
    ).toBe('#f59e0b');
    expect(
      component.getNodeColor({
        id: '6',
        name: 'Router 3',
        type: 'router',
        status: 'error',
        metadata: {},
        ipAddress: '192.168.1.6',
      })
    ).toBe('#ef4444');
  });

  it('should return correct node icon', () => {
    expect(
      component.getNodeIcon({
        id: '1',
        name: 'Router 1',
        type: 'router',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.1',
      })
    ).toBe('\\F5A0');
    expect(
      component.getNodeIcon({
        id: '2',
        name: 'Server 1',
        type: 'server',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.2',
      })
    ).toBe('\\F5B7');
    expect(
      component.getNodeIcon({
        id: '3',
        name: 'Workstation 1',
        type: 'workstation',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.3',
      })
    ).toBe('\\F5FC');
    expect(
      component.getNodeIcon({
        id: '4',
        name: 'Unknown 1',
        type: 'unknown',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.4',
      })
    ).toBe('\\F5DF');
    expect(
      component.getNodeIcon({
        id: '5',
        name: 'Nonexistent',
        type: 'nonexistent',
        status: 'normal',
        metadata: {},
        ipAddress: '192.168.1.5',
      })
    ).toBe('\\F5DF'); // Default case
  });

  it('should get node metadata entries', () => {
    component.selectedNode = {
      id: '1',
      name: 'Router 1',
      type: 'router',
      status: 'normal',
      metadata: {
        os: 'Linux',
        location: 'Data Center',
      },
      ipAddress: '192.168.1.1',
    };
    const entries = component.getNodeMetadataEntries();
    expect(entries.length).toBe(2);
    expect(entries[0].key).toBe('Os');
    expect(entries[0].value).toBe('Linux');
  });

  it('should return empty metadata entries if no selectedNode or metadata', () => {
    component.selectedNode = null;
    expect(component.getNodeMetadataEntries().length).toBe(0);
    component.selectedNode = {
      id: '1',
      name: 'Router 1',
      type: 'router',
      status: 'normal',
      metadata: {},
      ipAddress: '192.168.1.1',
    };
    expect(component.getNodeMetadataEntries().length).toBe(0);
  });

  it('should zoom in and zoom out without errors', fakeAsync(() => {
    fixture.detectChanges();
    component.ngAfterViewInit();
    tick();
    expect(() => component.zoomIn()).not.toThrow();
    expect(() => component.zoomOut()).not.toThrow();
  }));

  it('should reset zoom without errors', fakeAsync(() => {
    fixture.detectChanges();
    component.ngAfterViewInit();
    tick();
    expect(() => component.resetZoom()).not.toThrow();
  }));

  afterEach(() => {
    if ((component as any)['subscription']) {
      (component as any)['subscription'].unsubscribe();
    }
    if ((component as any)['simulation']) {
      (component as any)['simulation'].stop();
    }
  });
});
