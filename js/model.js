/* ============ DATA MODEL ============ */
// A linked list, represented as plain data
// nodes:  array of {id, value, x (fixed pixel slot), next: id|null}
// headId: the id of the current head node, or null if the list is empty

let nodes = [];
let headId = null;
let nextId = 1;
let nextSlot = 0; // fixed x-slot counter

const SLOT_W = 96;
const START_X = 20;

// Rebuilds list from scratch given array of values
function freshList(values){
  nodes = [];
  headId = null;
  nextId = 1;
  nextSlot = 0;
  let prev = null;
  values.forEach(v=>{
    const n = {id: nextId++, value: v, x: START_X + nextSlot*SLOT_W, next: null};
    nextSlot++;
    nodes.push(n);
    if(prev===null){ headId = n.id; } else { prev.next = n.id; }
    prev = n;
  });
}
freshList([4,9,2]);

function findNode(id){ return nodes.find(n=>n.id===id); }

// Returns node ids in current list order
function getOrder(){
  const order = [];
  let cur = headId;
  let guard = 0;
  while(cur!==null && guard < 1000){
    order.push(cur);
    cur = findNode(cur).next;
    guard++;
  }
  return order;
}

// Takes an immutable copy of the list's current state, for use in one playback step
function snapshotNow(dyingIds){
  dyingIds = dyingIds || [];
  return {
    nodes: nodes.filter(n=>!dyingIds.includes(n.id)).map(n=>({...n})),
    headId
  };
}