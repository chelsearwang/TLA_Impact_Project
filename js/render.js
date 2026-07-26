/* ============ RENDERING ============ */
// Draws a single "step" object: node boxes, arrows, head/null labels, code + explanation panel

const stageInner = document.getElementById('stageInner');
const svg = document.getElementById('arrowSvg');
const codeBox = document.getElementById('codeBox');
const descText = document.getElementById('descText');
const stepProgress = document.getElementById('stepProgress');

function render(step, stepIndex, totalSteps){
  if(!step){
    stageInner.querySelectorAll('.node, .null-tag, .head-label').forEach(e=>e.remove());
    const empty = document.createElement('div');
    empty.className='stage-empty';
    empty.textContent='(empty list)';
    stageInner.appendChild(empty);
    codeBox.innerHTML = '<span class="cline">// choose an operation above</span>';
    descText.innerHTML = 'Run an operation above to see it explained step by step here.';
    stepProgress.textContent = '';
    clearArrows();
    return;
  }
  stageInner.querySelectorAll('.stage-empty').forEach(e=>e.remove());
  const snap = step.snapshot;
  const highlight = step.highlight || [];
  const foundId = step.foundId || null;
  const newIds = step.newIds || [];
  const dyingIds = step.dyingIds || [];

  // remove stale DOM nodes not in this snapshot and not currently dying
  const keepIds = new Set(snap.nodes.map(n=>n.id));
  stageInner.querySelectorAll('.node').forEach(el=>{
    const id = parseInt(el.dataset.id,10);
    if(!keepIds.has(id) && !dyingIds.includes(id)) el.remove();
  });

  let maxRight = 0;

  snap.nodes.forEach(n=>{
    maxRight = Math.max(maxRight, n.x + 56);
    let el = stageInner.querySelector('.node[data-id="'+n.id+'"]');
    if(!el){
      el = document.createElement('div');
      el.className = 'node';
      el.dataset.id = n.id;
      el.innerHTML = '<span class="val"></span><span class="idx"></span>';
      stageInner.appendChild(el);
      if(newIds.includes(n.id)){
        el.classList.add('new');
        requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('new')));
      }
    }
    el.style.left = n.x + 'px';
    el.querySelector('.val').textContent = n.value;
    el.querySelector('.idx').textContent = 'mem+'+n.id;
    el.classList.toggle('active', highlight.includes(n.id));
    el.classList.toggle('found', foundId===n.id);
  });

  dyingIds.forEach(id=>{
    let el = stageInner.querySelector('.node[data-id="'+id+'"]');
    if(el){
      el.classList.add('dying');
      setTimeout(()=>el.remove(), 320);
    }
  });

  // head label
  let headLabel = stageInner.querySelector('.head-label');
  if(!headLabel){
    headLabel = document.createElement('div');
    headLabel.className = 'head-label';
    stageInner.appendChild(headLabel);
  }
  if(snap.headId!==null){
    const hn = snap.nodes.find(n=>n.id===snap.headId);
    if(hn){
      headLabel.style.left = hn.x + 'px';
      headLabel.style.top = '2px';
      headLabel.textContent = 'head ↓';
      headLabel.style.display='block';
    }
  } else {
    headLabel.style.display='none';
  }

  // null tag after tail
  let nullTag = stageInner.querySelector('.null-tag');
  if(!nullTag){
    nullTag = document.createElement('div');
    nullTag.className = 'null-tag';
    stageInner.appendChild(nullTag);
  }
  const order = [];
  if(snap.headId!==null){
    let cur = snap.headId, guard=0;
    const byId = {}; snap.nodes.forEach(n=>byId[n.id]=n);
    while(cur!==null && guard<1000){
      order.push(byId[cur]);
      cur = byId[cur] ? byId[cur].next : null;
      guard++;
    }
  }
  if(order.length){
    const tail = order[order.length-1];
    nullTag.style.left = (tail.x + 68) + 'px';
    nullTag.style.top = '57px';
    nullTag.textContent = 'null';
    nullTag.style.display='inline-block';
    maxRight = Math.max(maxRight, tail.x + 68 + 50);
  } else {
    nullTag.style.display='none';
  }

  stageInner.style.width = Math.max(600, maxRight+20) + 'px';

  // arrows
  clearArrows();
  const byId = {}; snap.nodes.forEach(n=>byId[n.id]=n);
  snap.nodes.forEach(n=>{
    if(n.next!==null && byId[n.next]){
      drawArrow(n, byId[n.next], step.arrowHighlight && step.arrowHighlight.some(pair=>pair[0]===n.id && pair[1]===n.next));
    }
  });

  // code + explanation
  codeBox.innerHTML = step.codeLines.map((line,i)=>{
    const hi = (i===step.hiLine) ? ' hi' : '';
    return '<div class="cline'+hi+'">'+escapeHtml(line)+'</div>';
  }).join('');
  descText.innerHTML = step.desc;
  stepProgress.textContent = 'Step '+(stepIndex+1)+' of '+totalSteps;
}

function clearArrows(){
  svg.querySelectorAll('path.arrow-line').forEach(e=>e.remove());
}

function drawArrow(fromNode, toNode, isActive){
  const NODE_W = 56, NODE_H = 56, TOP = 40;
  const fromCenterY = TOP + NODE_H/2;
  const x1 = fromNode.x + NODE_W;
  const y1 = fromCenterY;
  let x2, y2, d;
  if(toNode.x >= fromNode.x){
    x2 = toNode.x;
    y2 = TOP + NODE_H/2;
    const midX = (x1+x2)/2;
    d = `M ${x1} ${y1} C ${midX} ${y1-18}, ${midX} ${y2-18}, ${x2} ${y2}`;
  } else {
    // pointing backward (after reverse) — arc above the nodes instead
    const arcTop = Math.min(y1, TOP) - 40;
    d = `M ${fromNode.x+NODE_W/2} ${TOP} C ${fromNode.x+NODE_W/2} ${arcTop}, ${toNode.x+NODE_W/2} ${arcTop}, ${toNode.x+NODE_W/2} ${TOP}`;
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d', d);
  path.setAttribute('class','arrow-line');
  path.setAttribute('fill','none');
  path.setAttribute('stroke', isActive ? 'var(--active)' : 'var(--ink)');
  path.setAttribute('stroke-width', isActive ? '2.5' : '2');
  path.setAttribute('marker-end', isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)');
  svg.appendChild(path);
}

function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}