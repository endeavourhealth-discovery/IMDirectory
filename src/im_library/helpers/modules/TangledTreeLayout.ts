import * as d3 from "d3";
export function constructTangleLayout(levels:any, options:any) {
  // precompute level depth
  levels.forEach((l:any , i:any ) => l.forEach((n: any) => (n.level = i)));

  let nodes = levels.reduce((a:any , x:any) => a.concat(x), []);
  let nodes_index = {} as any;
  nodes.forEach((d:any) => (nodes_index[d.id] = d));

  // objectification
  nodes.forEach((d:any) => {
    d.parents = (d.parents === undefined ? [] : d.parents).map(
      (p:any) => {
        if(typeof p === "string")
          return nodes_index[p];
        else
          return p;
      }
    );
  });

  // precompute bundles
  levels.forEach((l:any, i:any) => {
    let index = {} as any;
    l.forEach((n:any) => {
      if (n.parents.length == 0) {
        return;
      }

      let id = n.parents
        .map((d:any) => d.id)
        .sort()
        .join('-X-');
      if (id in index) {
        index[id].parents = index[id].parents.concat(n.parents);
      } else {
        // @ts-ignore
        index[id] = { id: id, parents: n.parents.slice(), level: i, span: i - d3.min(n.parents, (p:any) => p.level) };
      }
      n.bundle = index[id];
    });
    l.bundles = Object.keys(index).map((k:any) => index[k]);
    l.bundles.forEach((b:any, i:any) => (b.i = i));
  });

  let links = [] as any[];
  nodes.forEach((d:any) => {
    d.parents.forEach((p:any) =>
                        links.push({ source: d, bundle: d.bundle, target: p })
    );
  });

  let bundles = levels.reduce((a:any, x:any) => a.concat(x.bundles), []);

  // reverse pointer from parent to bundles
  bundles.forEach((b:any) =>
                    b.parents.forEach((p:any) => {
                      if (p.bundles_index === undefined) {
                        p.bundles_index = {};
                      }
                      if (!(b.id in p.bundles_index)) {
                        p.bundles_index[b.id] = [];
                      }
                      p.bundles_index[b.id].push(b);
                    })
  );

  nodes.forEach((n:any) => {
    if (n.bundles_index !== undefined) {
      n.bundles = Object.keys(n.bundles_index).map(k => n.bundles_index[k]);
    } else {
      n.bundles_index = {};
      n.bundles = [];
    }
    n.bundles.sort((a:any,b:any) => d3.descending(d3.max(a, (d:any) => d.span), d3.max(b, (d:any) => d.span)))
    n.bundles.forEach((b:any, i:any) => (b.i = i));
  });

  links.forEach(l => {
    if (l.bundle.links === undefined) {
      l.bundle.links = [];
    }
    l.bundle.links.push(l);
  });

  // layout
  const padding = 8;
  const node_height = 25;
  const node_width = 170;
  const bundle_width = 14;
  const level_y_padding = 16;

  options.value.c ||= 16;
  const c = options.value.c;
  options.value.bigc ||= node_width+c;

  nodes.forEach(
    (n:any) => (n.height = (Math.max(1, n.bundles.length) - 1))
  );

  let x_offset = padding;
  let y_offset = padding;
  levels.forEach((l:any) => {
    x_offset += l.bundles.length * bundle_width;
    y_offset += level_y_padding;

    l.forEach((n:any, i:any) => {
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;
      n.xz=0;
      n.yz=0;

      y_offset += node_height + n.height;
    });
  });

  let i = 0;
  levels.forEach((l:any) => {
    l.bundles.forEach((b:any) => {
      // @ts-ignore
      b.x = d3.max(b.parents, (d:any)=> d.x) + node_width + (l.bundles.length - 1 - b.i) * bundle_width;
      b.y = i * node_height;
    });
    i += l.length;
  });

  links.forEach(l => {
    l.xt = l.target.x;
    l.yt = l.target.y;
    l.xb = l.bundle.x;
    l.yb = l.bundle.y;
    l.xs = l.source.x;
    l.ys = l.source.y;
  });

  let color = 16;
  links.forEach(l => {
    l.yt = l.target.y;
    l.ys = l.source.y;
    l.c1 = l.source.level - l.target.level > 1 ? Math.min(options.value.bigc, l.xb-l.xt, l.yb-l.yt)-c : c;
    l.c2 = c;
    l.color = color;
    color += 20;
  });


  let layout = {
    // @ts-ignore
    width: d3.max(nodes, (n:any) => n.x) + node_width + 2 * padding,
    // @ts-ignore
    height: d3.max(nodes, (n:any) => n.y) + node_height / 2 + 2 * padding,
    node_height,
    node_width,
    bundle_width,
    level_y_padding
  };

  return { levels, nodes, nodes_index, links, bundles, layout };
}

export default {
 constructTangleLayout
};