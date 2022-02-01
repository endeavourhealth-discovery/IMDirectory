<template>
  <side-nav />
  <div class="layout-main">
    <div class="home">
      <div class="p-grid">
        <div class="p-col-3">
          <TabView v-model:activeIndex="active">
            <TabPanel>
              <template #header>
                <i class="fas fa-project-diagram" style="padding: 1px;" aria-hidden="true" />
                <span>Workflows</span>
              </template>
              <Listbox v-model="selectedWorkflow" :options="workflowTypes" @click="createPanel()">
                <template #option="slotProps">
                  <div>
                    <span>{{ slotProps.option }}</span>
                  </div>
                </template>
              </Listbox>
            </TabPanel>
          </TabView>
        </div>
        <div class="p-col-9" style="height: calc(100vh - 123px); overflow: auto">
          <div class="p-grid">
            <div class="p-col-12">
              <Panel>
                <template #header> {{ selectedWorkflow }} Workflow </template>
                <div id="diagram"></div>
                <DataTable
                  :value="tasks"
                  class="p-datatable-sm"
                  :paginator="true"
                  :rows="10"
                  dataKey="id"
                  stripedRows
                  v-model:filters="filters"
                  multiple="false"
                >
                  <template #header>
                    <div class="p-d-flex p-jc-between">
                      <span>
                        All tasks currently in the
                        {{ selectedWorkflow }}
                        Workflow
                      </span>
                      <span class="p-input-icon-left">
                        <i class="pi pi-search" aria-hidden="true" />
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                      </span>
                    </div>
                  </template>
                  <Column field="name" header="Task Name"></Column>
                  <Column field="state" header="Current State"></Column>
                </DataTable>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideNav from "@/components/home/SideNav.vue";
import WorkflowService from "@/services/WorkflowService";
import { FilterMatchMode } from "primevue/api";
import { Filters } from "@/models/workflow/Filters";
import * as d3 from "d3";

export default defineComponent({
  name: "Workflow",
  components: {
    SideNav
  },
  data() {
    return {
      links: [{ source: "", name: "", target: "" }],
      width: 500,
      height: 300,
      padding: 10,
      tasksData: [] as any,
      workflows: [] as any,
      tasks: [] as any,
      selectedWorkflow: "Concept",
      workflowTypes: [] as any,
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
      } as Filters,
      active: 0,
      currentWorkflow: ""
    };
  },
  mounted() {
    this.getWorkflows();
    this.getWorkflowTasks();
  },
  methods: {
    async getWorkflows() {
      const result = await WorkflowService.getWorkflows();
      if (result) {
        this.workflows = result;
        this.workflows.forEach((workflow: any) => {
          this.workflowTypes.push(workflow.type);
        });
      }
    },

    async getWorkflowTasks() {
      const result = await WorkflowService.getWorkflowTasks();
      if (result) this.tasksData = result;
      this.createPanel();
    },
    createPanel() {
      if (this.selectedWorkflow == null) {
        this.selectedWorkflow = this.currentWorkflow;
      }
      this.getTransitions();
      this.getTasks();
      this.createDiagram();
      this.currentWorkflow = this.selectedWorkflow;
    },
    getTransitions() {
      this.links = [];
      this.workflows.forEach((workflow: any) => {
        if (workflow.type == this.selectedWorkflow) {
          workflow.validStates.forEach((state: any) => {
            if (workflow.transitions[state]) {
              const transition = workflow.transitions[state];
              workflow.validEvents.forEach((event: any) => {
                if (transition[event]) {
                  this.links.push({
                    source: state,
                    name: event,
                    target: transition[event]
                  });
                }
              });
            }
          });
        }
      });
    },
    getTasks() {
      this.tasks = [];
      this.tasksData.forEach((task: any) => {
        if (task.workflow == this.selectedWorkflow) {
          this.tasks.push(task);
        }
      });
    },
    createDiagram() {
      const doc = document.getElementById("diagram");
      if (doc != null) {
        doc.innerHTML = "";
      }
      const w = 900;
      const h = 200;
      const color = d3.scaleOrdinal(this.events, d3.schemeSet1);
      const links = this.transData.links.map((d: any) => Object.create(d));
      const nodes = this.transData.nodes.map((d: any) => Object.create(d));
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d: any) => d.id)
        )
        .force("charge", d3.forceManyBody().strength(-2000))
        .force("x", d3.forceX().strength(0.05))
        .force("y", d3.forceY().strength(0.2));
      const svg = d3
        .select("#diagram")
        .append("svg")
        .attr("viewBox", [-w / 2 + 50, -h / 2 + 10, w, h] as any)
        .attr("width", w)
        .attr("height", h);
      // Per-type markers, as they don't inherit styles.
      svg
        .append("defs")
        .selectAll("marker")
        .data(this.events)
        .join("marker")
        .attr("id", (d: any) => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 17)
        .attr("refY", -0.5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");
      const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", (d: any) => color(d.name))
        .attr("marker-end", (d: any) => "url(" + new URL(`#arrow-${d.name}`, location as any) + ")");
      const node = svg
        .append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes)
        .join("g");
      node
        .append("circle")
        .attr("stroke", "black")
        .attr("fill", "white")
        .attr("stroke-width", 2)
        .attr("r", 4);
      node
        .append("text")
        .attr("x", -20)
        .attr("y", -20)
        .text((d: any) => d.id)
        .clone(true)
        .lower()
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .style("font-size", 12);
      simulation.on("tick", () => {
        link.attr("d", linkArc);
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });
      const legend = svg
        .append("g")
        .selectAll("g")
        .data(this.events)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(${w / 2 - 100},${i * 20 - 50})`);
      legend
        .append("rect")
        .attr("width", 15)
        .attr("height", 3)
        .attr("fill", color as any);
      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 2)
        .attr("dy", "0.35em")
        .text((d: any) => d)
        .style("font-size", 12);
      function linkArc(d: any) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        if (d.target.x - d.source.x == 0 && d.target.y - d.source.y == 0) {
          return `M${d.source.x},${d.source.y}A 15, 15 1 1, 1 ${d.target.x - 1},${d.target.y - 1}`;
        } else {
          return `M${d.source.x},${d.source.y - 2}A${r},${r} 0 0,0 ${d.target.x},${d.target.y + 2}`;
        }
      }
    }
  },
  computed: {
    events(): any {
      return Array.from(new Set(this.links.map((d: any) => d.name)));
    },
    transData(): any {
      return {
        nodes: Array.from(new Set(this.links.flatMap((l: any) => [l.source, l.target])), id => ({ id })),
        links: this.links
      };
    }
  }
});
</script>
<style scoped>
.p-timeline-event {
  min-width: 200px;
}
svg .withcss {
  marker-mid: url(#mid_arrow);
}
.p-timeline-event-content {
  min-height: 88px;
}
.p-selectbutton .p-button {
  width: auto;
}
</style>
