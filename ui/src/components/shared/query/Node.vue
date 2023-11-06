<template>
  <div :class="'node ' + [highlighted ? 'highlighted ' : ''] + [connector ? ' connector' : '']">
    <!-- Custom Sentences - add new ones here  -->
    <template v-if="template == 'MainEntity' && entity">
      <NodeCard icon="user" :title="entity.name" :definition="entity" :allowExpansion="false"> </NodeCard>
      <div class="linked-line"></div>
      <Node class="linked-entities" :object="data" path="select.match" operator="and" :highlighted="true" :edit="edit"> </Node>
    </template>

    <div v-else-if="template == 'leafEntity'">
      <NodeCard
        v-if="hasKey(entity, 'entityInSet')"
        icon="search"
        :title="'is ' + [entity?.notExist ? 'not ' : ''] + 'part of the results of the search ' + entity?.entityInSet[0].name"
        :definition="entity"
      >
      </NodeCard>
      <template v-else-if="isOperator(entity)"> </template>

      <NodeCard
        :data="data"
        :path="path"
        v-else-if="entity?.displayText"
        icon="document_text"
        :title="entity.displayText"
        :definition="entity"
        :allowExpansion="true"
      ></NodeCard>
      <NodeCard v-else icon="question_mark_circle" title="Undefined Criteria" :definition="entity"> </NodeCard>
    </div>
    <!-- /Custom Sentences - add new ones here -->

    <!--  Clause  -->
    <template v-if="entity && children(entity).length" v-for="(child, childIndex) in children(entity)" :key="child?.path">
      <div class="connector operator horizontal">
        <!-- Connector -->
        <div class="connector-h">
          <div class="circle"></div>
          <template v-if="showLineV(index, indexCount, childIndex, children(entity).length)">
            <div class="line-v"></div>
            <div :class="'operator-label ' + getOperatorLabel(child)">{{ getOperatorLabel(child) }}</div>
          </template>
        </div>
        <div v-if="!isOperator(entity)" class="line-h"></div>
        <!-- /Connector -->

        <!-- Operator Children -->
        <div v-if="children(child.value).length" class="operator-items">
          <!-- Connector -->
          <div v-for="(grandChild, grandChildIndex) in children(child.value)" class="operator-item">
            <div v-if="showConnector(grandChildIndex, children(child.value).length)" class="connector">
              <div class="connector-h">
                <div class="circle"></div>
                <template v-if="showLineV(childIndex, children(entity).length, grandChildIndex, children(child.value).length)">
                  <div class="line-v"></div>
                  <div :class="'operator-label ' + getOperatorLabel(grandChild)">{{ getOperatorLabel(child) }}</div>
                </template>
              </div>
              <div class="line-h"></div>
            </div>

            <Node
              :object="data"
              :path="`${path}[${child?.path}].${grandChild?.path}`"
              :operator="grandChildIndex > 0 ? child.path : ''"
              :index="grandChildIndex"
              :edit="edit"
              :indexCount="children(child.value).length"
              template="leafEntity"
            >
            </Node>
          </div>
          <!-- /Connector -->
        </div>
        <!--  /Operator Children  -->

        <!-- Leaf Child -->
        <template v-else>
          <Node :object="data" :path="`${path}[${child?.path}]`" :edit="edit" template="leafEntity"> </Node>
        </template>
        <!-- /Leaf Child  -->
      </div>
    </template>

    <!--  /Clause  -->

    <!-- Child Nodes -->
    <slot> </slot>
    <!-- Child Nodes -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import NodeCard from "./NodeCard.vue";
import NodeIcon from "./NodeIcon.vue";
import _ from "lodash";

export default defineComponent({
  name: "Node",
  components: { NodeIcon, NodeCard },
  props: [
    "indexCount",
    "index",
    "template",
    "connector",
    "modelValue",
    "object",
    "path",
    "parentPath",
    "valueType",
    "keys",
    "excludedKeys",
    "operator",
    "highlighted",
    "edit"
  ],
  emits: ["selectedClauseUpdated"],
  methods: {
    showLineV(index: number, indexCount: number, childIndex: number, childIndexCount: number): boolean {
      if (childIndexCount > 0 && childIndex < childIndexCount - 1) {
        return true;
      } else if (index == indexCount - 1) {
        //last item in a list should not have a line below it
        return false;
      } else if (!index && !indexCount) {
        return false;
      } else {
        return false;
      }
    },
    showOperator(path: string, index: number, childIndex: number): boolean {
      if ((index == 0 || childIndex == 0) && this.operator == "or") {
        return true;
      }
      if (index > 0 || childIndex > 0) return true;

      return false;
    },
    showConnector(index: any, indexCount: number): boolean {
      if (indexCount == 1) {
        return false;
      } else {
        return true;
      }
    },
    showLineH(index: number, indexCount: number): boolean {
      if (index == indexCount - 1) {
        return false;
      } else {
        return true;
      }
    },
    isOperator(testObject: any): boolean {
      if ((this.hasKey(testObject, "and") || this.hasKey(testObject, "or")) && Object.keys(testObject).length == 1) {
        return true;
      } else {
        return false;
      }
    },
    hasKey(testObjecty: any, comparatorKey: string): boolean {
      return Object.keys(testObjecty).some(key => key == comparatorKey);
    },
    getOperatorLabel(object: any): string {
      if (object?.value?.or) {
        return "or";
      } else if (object?.value?.property) {
        return "and";
      } else {
        return "and";
      }
    },
    children(testObject: any): any {
      // console.log("keys", Object.keys(testObject));
      if (Array.isArray(testObject)) {
        return testObject.map((obj: string, index: number) => {
          return { path: index, value: obj };
        });
      } else {
        const includedKeys = ["and", "or", "property"];
        const excludedKeys = ["entityInSet", "pathTo", "alias"];

        const includedKey = Object.keys(testObject).find((key: string) => includedKeys.includes(key));
        const excludedKey = Object.keys(testObject).find((key: string) => excludedKeys.includes(key));

        if (includedKey && !excludedKey) {
          return testObject[includedKey].map((child: string, index: number) => {
            return { path: `${includedKey}[${index}]`, value: child };
          });
        } else {
          return [];
        }
      }
    }
  },
  data() {
    return {
      data: this.object,
      editMode: this.edit,
      entity: this.path ? _.get(this.object, this.path) : this.object,
      parent: this.parentPath ? _.get(this.object, this.parentPath) : null
    };
  },
  computed: {
    a: {
      get() {
        const testString = this?.entity?.name;
        if (!testString || testString == "") return "a";
        return ["a", "e", "i", "o", "u"].some((letter: string) => letter.toLowerCase() == testString.substring(0, 1).toLowerCase()) ? "an" : "a";
      },
      set() {}
    }
  },
  watch: {
    edit(newValue: boolean) {
      this.editMode = newValue;
    },
    object(newValue: any) {
      this.data = newValue;
      this.entity = this.path ? _.get(newValue, this.path) : newValue;
      this.parent = this.parentPath ? _.get(this.object, this.parentPath) : null;
    }
  }
});
</script>

<style>
.linked-entities {
  margin-left: 14px;
}

.operator-item {
  display: flex;
}
.connector {
  display: flex;
}

.connector-h {
  position: relative;
}

.flex {
  display: flex;
}

.line-h {
  min-width: 15px;
  width: 15px;
  margin: 9px 1px 0 0;
  border-top: 2px solid var(--surface-border);
}

.linked-line {
  min-width: 10px;
  margin-left: 20px;
  margin-top: -8px;
  margin-bottom: 2px;
  min-height: 15px;
  border-left: 2px solid var(--surface-border);
}

.line-v {
  display: inline-block;
  min-width: 10px;
  margin-left: 5px;
  min-height: calc(100% - 25px);
  border-left: 2px solid var(--surface-border);
}

.operatorlabel {
  top: calc(50% - 5px);
  right: 20px;
}

.circle {
  margin: 3px 3px 5px 0px;
  border: 2px solid var(--surface-b);
  min-width: 13px;
  min-height: 13px;
  width: 13px;
  height: 13px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.circle.middle {
  top: calc(50% + 10px);
}

.connector-text {
  padding-top: 5px;
  margin-bottom: 5px;
  margin-left: 30px;
}

.ml {
  margin-left: 10px;
}

.flex-wrap {
  flex-wrap: wrap;
}

.node,
.node .static {
  font-size: 14px !important;
  font-weight: 400 !important;
  color: var(--font-color) !important;
}

.node .vertical {
  display: inline-flex;
  flex-direction: column;
}

.subphrase {
  display: inline-flex;
}

.horizontal {
  display: flex;
}

.horizontal > :not(:first-child),
.subset > :not(:first-child) {
  margin-left: 5px;
}

.node.highlighted .operator-label,
.node.highlighted .keyword {
  font-weight: 600;
  color: var(--purple-500);
}

.node.highlighted .iriref {
  font-weight: 700;
  color: var(--blue-500);
}

.node .iriref:hover {
  cursor: pointer;
}

.static {
  display: inline-flex;
}

.iriref {
  display: flex;
}

.node .operator,
.node .property {
  border-radius: 0.375rem;
  border-width: 1px;
  border-color: transparent;
}

.operator-items {
  display: flex;
  flex-direction: column;
}

.operator-label {
  min-width: 30px;
  position: absolute;
  top: calc(50% - 3px);
}

.operator-label.and {
  left: -22px;
}

.operator-label.or {
  left: -15px;
}

.operator-items:first-child {
  margin-left: 20px;
}
</style>
