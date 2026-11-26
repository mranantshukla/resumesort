"use client";

import { useMemo, useState } from "react";
import { ReactFlow, Controls, Handle, Position, type Edge, type Node, type NodeProps } from "@xyflow/react";
import type { Guesstimate, TreeNode } from "@/engine/types";
import { childrenOf, evaluateTree, formulaTex, type TreeEvaluation, type TreeOverrides } from "@/engine/tree";
import { formatValue, indian, parseNumberInput } from "@/engine/format";
import { Badge, Button, Card, Formula, cn } from "@/components/ui";
import { Plus, Trash2, EyeOff, Eye } from "lucide-react";

export interface TreeViewProps {
  problem: Guesstimate;
  tree: TreeNode;
  values: Record<string, number>;
  overrides: TreeOverrides;
  /** Node ids whose computed value may be shown (others show "?" so the solution isn't revealed). */
  revealed: Set<string> | "all";
  showValues: boolean;
  editable: boolean;
  onToggleExclude?: (nodeId: string) => void;
  onAddSegment?: (parentId: string, node: TreeNode) => void;
  onRemoveCustom?: (parentId: string, nodeId: string) => void;
  height?: number;
}

type FlowData = {
  node: TreeNode;
  value: string;
  unit: string;
  issue: string | null;
  excluded: boolean;
  selected: boolean;
};

const KIND_LABEL: Record<string, string> = { product: "×", sum: "+", divide: "÷", min: "min", var: "" };

function EstimateNode({ data }: NodeProps<Node<FlowData>>) {
  const { node, value, unit, issue, excluded, selected } = data;
  return (
    <div
      className={cn(
        "w-[188px] rounded-lg border bg-surface px-2.5 py-2 text-left shadow-card transition-colors",
        node.kind === "var" ? "border-line" : "border-accent/40",
        node.custom && "border-dashed",
        issue && "border-bad bg-bad-soft",
        excluded && "opacity-40",
        selected && "ring-2 ring-accent",
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-line" />
      <div className="flex items-start justify-between gap-1">
        <span className="text-[12px] font-semibold leading-tight">{node.label}</span>
        {node.kind !== "var" && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] text-accent">{KIND_LABEL[node.kind]}</span>}
      </div>
      <div className="tabular mt-1 font-mono text-[12.5px]">{value}</div>
      <div className="truncate text-[10.5px] text-muted">{unit}</div>
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-line" />
    </div>
  );
}

const nodeTypes = { estimate: EstimateNode };

function layout(root: TreeNode, overrides: TreeOverrides) {
  const pos: Record<string, { x: number; y: number }> = {};
  let leaf = 0;
  const W = 208;
  const H = 112;
  const walk = (n: TreeNode, depth: number): number => {
    const kids = childrenOf(n, overrides);
    let x: number;
    if (!kids.length) {
      x = leaf * W;
      leaf += 1;
    } else {
      const xs = kids.map((k) => walk(k, depth + 1));
      x = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    pos[n.id] = { x, y: depth * H };
    return x;
  };
  walk(root, 0);
  return pos;
}

export function TreeView({ problem, tree, values, overrides, revealed, showValues, editable, onToggleExclude, onAddSegment, onRemoveCustom, height = 380 }: TreeViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const ev: TreeEvaluation = useMemo(() => evaluateTree(tree, problem.variables, values, overrides), [tree, problem.variables, values, overrides]);
  const varMap = useMemo(() => new Map(problem.variables.map((v) => [v.id, v])), [problem.variables]);

  const parentOf = useMemo(() => {
    const m: Record<string, TreeNode> = {};
    const walk = (n: TreeNode) => childrenOf(n, overrides).forEach((c) => ((m[c.id] = n), walk(c)));
    walk(tree);
    return m;
  }, [tree, overrides]);

  const { nodes, edges } = useMemo(() => {
    const pos = layout(tree, overrides);
    const issueBy = new Map(ev.issues.map((i) => [i.nodeId, i.message]));
    const nodes: Node<FlowData>[] = [];
    const edges: Edge[] = [];
    const walk = (n: TreeNode) => {
      const r = ev.results[n.id];
      const v = n.varId ? varMap.get(n.varId) : undefined;
      const canShow = showValues && (revealed === "all" || n.kind === "var" || !!n.literal || revealed.has(n.id));
      let value = "?";
      if (canShow && r) value = v ? formatValue(r.value, v.unit) : indian(r.value);
      const unit = v ? v.displayUnit ?? (v.unit === "%" ? "share" : v.unit) : n.literal ? n.literal.unit : n.unit ?? r?.unitLabel ?? "";
      nodes.push({
        id: n.id,
        type: "estimate",
        position: pos[n.id],
        data: { node: n, value, unit, issue: issueBy.get(n.id) ?? null, excluded: (overrides.excluded ?? []).includes(n.id), selected: selected === n.id },
        draggable: false,
      });
      childrenOf(n, overrides).forEach((c) => {
        edges.push({ id: `${n.id}-${c.id}`, source: n.id, target: c.id, type: "smoothstep" });
        walk(c);
      });
    };
    walk(tree);
    return { nodes, edges };
  }, [tree, overrides, ev, varMap, showValues, revealed, selected]);

  const sel = selected ? nodes.find((n) => n.id === selected)?.data.node : undefined;
  const selParent = sel ? parentOf[sel.id] : undefined;

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2/50" style={{ height }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          nodesConnectable={false}
          onNodeClick={(_, n) => setSelected((s) => (s === n.id ? null : n.id))}
          onPaneClick={() => setSelected(null)}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>
      {ev.issues.length > 0 && (
        <div className="grid gap-1.5">
          {ev.issues.map((i) => (
            <p key={i.nodeId + i.kind} className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">
              Unit check: {i.message}
            </p>
          ))}
        </div>
      )}
      {sel ? (
        <NodeInspector
          problem={problem}
          node={sel}
          parent={selParent}
          overrides={overrides}
          editable={editable}
          valueLabel={nodes.find((n) => n.id === sel.id)?.data.value ?? "?"}
          onToggleExclude={onToggleExclude}
          onAddSegment={onAddSegment}
          onRemoveCustom={onRemoveCustom}
        />
      ) : (
        <p className="text-xs text-muted">Click any box to see its formula{editable ? ", switch a segment off, or add your own segment" : ""}.</p>
      )}
    </div>
  );
}

function NodeInspector({
  problem,
  node,
  parent,
  overrides,
  editable,
  valueLabel,
  onToggleExclude,
  onAddSegment,
  onRemoveCustom,
}: {
  problem: Guesstimate;
  node: TreeNode;
  parent?: TreeNode;
  overrides: TreeOverrides;
  editable: boolean;
  valueLabel: string;
  onToggleExclude?: (id: string) => void;
  onAddSegment?: (parentId: string, node: TreeNode) => void;
  onRemoveCustom?: (parentId: string, nodeId: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [val, setVal] = useState("");
  const [unit, setUnit] = useState("");
  const v = node.varId ? problem.variables.find((x) => x.id === node.varId) : undefined;
  const excluded = (overrides.excluded ?? []).includes(node.id);
  const parentIsSum = parent && (parent.kind === "sum" || parent.kind === "min");
  const n = parseNumberInput(val);

  return (
    <Card className="grid gap-2 p-3.5 animate-rise">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{node.label}</span>
        <Badge>{valueLabel}</Badge>
        {node.custom && <Badge tone="accent">Your segment</Badge>}
        {excluded && <Badge tone="warn">Switched off</Badge>}
      </div>
      {node.kind !== "var" && !node.literal && <Formula tex={formulaTex(node, overrides)} className="text-sm" />}
      {v && <p className="text-sm text-muted">Assumption. {v.derive}</p>}
      {node.note && <p className="text-sm text-muted">{node.note}</p>}
      {editable && (
        <div className="flex flex-wrap gap-2">
          {parentIsSum && !node.custom && onToggleExclude && (
            <Button size="sm" onClick={() => onToggleExclude(node.id)}>
              {excluded ? <Eye size={14} /> : <EyeOff size={14} />}
              {excluded ? "Switch back on" : "Switch this segment off"}
            </Button>
          )}
          {node.custom && parent && onRemoveCustom && (
            <Button size="sm" variant="danger" onClick={() => onRemoveCustom(parent.id, node.id)}>
              <Trash2 size={14} /> Remove segment
            </Button>
          )}
        </div>
      )}
      {editable && (node.kind === "sum" || node.kind === "min") && onAddSegment && (
        <form
          className="grid gap-2 rounded-lg border border-line bg-surface-2 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim() || n === null) return;
            onAddSegment(node.id, { id: `custom-${Date.now()}`, label: label.trim(), kind: "var", custom: true, literal: { value: n, unit: unit.trim() || node.unit || "" } });
            setLabel("");
            setVal("");
            setUnit("");
          }}
        >
          <p className="text-sm font-medium">Add your own segment to “{node.label}”</p>
          <p className="text-xs text-muted">It must be in {node.unit ?? "the same unit as its siblings"} and must not overlap the existing segments, or you'll double count.</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_120px_150px_auto]">
            <input id="seg-label" aria-label="Segment name" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Cups at weddings" className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm" />
            <input id="seg-value" aria-label="Value" value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 0.05" className="h-9 rounded-md border border-line bg-surface px-2.5 font-mono text-sm" />
            <input id="seg-unit" aria-label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={node.unit ?? "unit"} className="h-9 rounded-md border border-line bg-surface px-2.5 font-mono text-sm" />
            <Button type="submit" size="md" variant="primary" disabled={!label.trim() || n === null}>
              <Plus size={14} /> Add
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
