/* ============ OPERATIONS -> STEP BUILDERS ============ */
// mutates the current global `nodes`/`headId` from model.js and returns finished array of steps for playback.js

const CODE_INSERT_HEAD = [
  'Node* insertAtHead(Node* head, int value) {',
  '  Node* node = new Node{value, nullptr};',
  '  node->next = head;',
  '  head = node;',
  '  return head;',
  '}'
];
function buildInsertHeadSteps(val){
  const steps = [];
  steps.push({snapshot: snapshotNow(), highlight:[], desc:'Starting list. We want to add <strong>'+val+'</strong> at the front.', codeLines:CODE_INSERT_HEAD, hiLine:0});
  // create node off to the side conceptually — just add it with next=null first
  const newNode = {id: nextId++, value: val, x: START_X + nextSlot*SLOT_W, next: null};
  nextSlot++;
  nodes.push(newNode);
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], newIds:[newNode.id], desc:'A new node holding <strong>'+val+'</strong> is created in memory. Its <strong>next</strong> is null for now — it isn\'t linked to anything yet.', codeLines:CODE_INSERT_HEAD, hiLine:1});
  const oldHead = headId;
  newNode.next = oldHead;
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], arrowHighlight: oldHead? [[newNode.id, oldHead]]:[], desc:'The new node\'s <strong>next</strong> pointer is set to the old head, so it now points at what used to be first.', codeLines:CODE_INSERT_HEAD, hiLine:2});
  headId = newNode.id;
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], desc:'<strong>head</strong> is reassigned to the new node. Nothing moved — we just changed which node the list starts counting from.', codeLines:CODE_INSERT_HEAD, hiLine:3});
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], desc:'The function returns the updated list.', codeLines:CODE_INSERT_HEAD, hiLine:4});
  return steps;
}

const CODE_INSERT_TAIL = [
  'Node* insertAtTail(Node* head, int value) {',
  '  Node* node = new Node{value, nullptr};',
  '  if (head == nullptr) {',
  '    head = node; return head;',
  '  }',
  '  Node* cur = head;',
  '  while (cur->next != nullptr) {',
  '    cur = cur->next;',
  '  }',
  '  cur->next = node;',
  '  return head;',
  '}'
];
function buildInsertTailSteps(val){
  const steps = [];
  steps.push({snapshot: snapshotNow(), highlight:[], desc:'Starting list. We want to add <strong>'+val+'</strong> at the end.', codeLines:CODE_INSERT_TAIL, hiLine:0});
  const newNode = {id: nextId++, value: val, x: START_X + nextSlot*SLOT_W, next: null};
  nextSlot++;
  nodes.push(newNode);
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], newIds:[newNode.id], desc:'A new node holding <strong>'+val+'</strong> is created in memory, not linked to anything yet.', codeLines:CODE_INSERT_TAIL, hiLine:1});
  if(headId===null){
    headId = newNode.id;
    steps.push({snapshot: snapshotNow(), highlight:[newNode.id], desc:'The list was empty, so the new node becomes <strong>head</strong> directly.', codeLines:CODE_INSERT_TAIL, hiLine:3});
    steps.push({snapshot: snapshotNow(), highlight:[newNode.id], desc:'The function returns the updated list.', codeLines:CODE_INSERT_TAIL, hiLine:10});
    return steps;
  }
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], desc:'The list isn\'t empty, so that shortcut is skipped — we need to walk to the real end.', codeLines:CODE_INSERT_TAIL, hiLine:2});
  let cur = headId;
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id, cur], desc:'<strong>cur</strong> starts at head.', codeLines:CODE_INSERT_TAIL, hiLine:5});
  let guard=0;
  while(true){
    const cn = findNode(cur);
    steps.push({snapshot: snapshotNow(), highlight:[newNode.id, cur], desc:'Is <strong>'+cn.value+'</strong>.next null yet?', codeLines:CODE_INSERT_TAIL, hiLine:6});
    if(cn.next===null) break;
    cur = cn.next;
    steps.push({snapshot: snapshotNow(), highlight:[newNode.id, cur], desc:'Not yet — <strong>cur</strong> steps forward to the next node.', codeLines:CODE_INSERT_TAIL, hiLine:7});
    guard++; if(guard>1000) break;
  }
  const tailNode = findNode(cur);
  tailNode.next = newNode.id;
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id, tailNode.id], arrowHighlight:[[tailNode.id, newNode.id]], desc:'<strong>'+tailNode.value+'</strong>.next is rewired to point at the new node, making it the true end of the list.', codeLines:CODE_INSERT_TAIL, hiLine:9});
  steps.push({snapshot: snapshotNow(), highlight:[newNode.id], desc:'The function returns the updated list.', codeLines:CODE_INSERT_TAIL, hiLine:10});
  return steps;
}

const CODE_DELETE = [
  'Node* deleteValue(Node* head, int value) {',
  '  if (head == nullptr) return head;',
  '  if (head->value == value) {',
  '    head = head->next;',
  '    return head;',
  '  }',
  '  Node* prev = head;',
  '  Node* cur = head->next;',
  '  while (cur != nullptr) {',
  '    if (cur->value == value) {',
  '      prev->next = cur->next;',
  '      return head;',
  '    }',
  '    prev = cur; cur = cur->next;',
  '  }',
  '  return head; // not found',
  '}'
];
function buildDeleteSteps(val){
  const steps = [];
  steps.push({snapshot: snapshotNow(), highlight:[], desc:'Looking for a node holding <strong>'+val+'</strong> to remove.', codeLines:CODE_DELETE, hiLine:0});
  steps.push({snapshot: snapshotNow(), highlight:[], desc:'List isn\'t empty, so we keep going.', codeLines:CODE_DELETE, hiLine:1});
  if(headId===null){
    return steps;
  }
  const headNode = findNode(headId);
  steps.push({snapshot: snapshotNow(), highlight:[headId], desc:'Checking the <strong>head</strong> node first: is '+headNode.value+' equal to '+val+'?', codeLines:CODE_DELETE, hiLine:2});
  if(headNode.value===val){
    const deletedId = headId;
    const newHead = headNode.next;
    steps.push({snapshot: snapshotNow(), highlight:[headId], dyingIds:[deletedId], desc:'Match — the <strong>head</strong> node itself holds '+val+'. <strong>head</strong> is reassigned to skip it.', codeLines:CODE_DELETE, hiLine:3});
    headId = newHead;
    nodes = nodes.filter(n=>n.id!==deletedId);
    steps.push({snapshot: snapshotNow(), highlight:[], desc:'The old head is now unreachable, so it\'s effectively removed. The function returns the updated list.', codeLines:CODE_DELETE, hiLine:4});
    return steps;
  }
  steps.push({snapshot: snapshotNow(), highlight:[headId], desc:'Not a match, so we start walking from the second node, tracking a <strong>prev</strong> pointer as we go.', codeLines:CODE_DELETE, hiLine:6});
  let prev = headId, cur = headNode.next, guard=0;
  let found=false;
  steps.push({snapshot: snapshotNow(), highlight:[headId, cur], desc:'<strong>prev</strong> starts at head, <strong>cur</strong> starts at the second node.', codeLines:CODE_DELETE, hiLine:7});
  while(cur!==null){
    const curNode = findNode(cur);
    steps.push({snapshot: snapshotNow(), highlight:[prev,cur], desc:'<strong>cur</strong> is not null, so the loop continues.', codeLines:CODE_DELETE, hiLine:8});
    steps.push({snapshot: snapshotNow(), highlight:[prev,cur], desc:'Comparing node <strong>'+curNode.value+'</strong> to '+val+'.', codeLines:CODE_DELETE, hiLine:9});
    if(curNode.value===val){
      found=true;
      const prevNode = findNode(prev);
      const afterId = curNode.next;
      const deletedId = cur;
      steps.push({snapshot: snapshotNow(), highlight:[prev,cur], dyingIds:[deletedId], desc:'Match found. <strong>'+prevNode.value+'</strong>.next is rewired to point past it, straight to whatever came after.', codeLines:CODE_DELETE, hiLine:10});
      prevNode.next = afterId;
      nodes = nodes.filter(n=>n.id!==deletedId);
      steps.push({snapshot: snapshotNow(), highlight:[prev], desc:'The deleted node is now unreachable, so it\'s gone. The function returns the updated list — one pointer changed, every other node stayed exactly where it was.', codeLines:CODE_DELETE, hiLine:11});
      break;
    }
    prev = cur; cur = curNode.next;
    steps.push({snapshot: snapshotNow(), highlight: cur? [prev,cur] : [prev], desc:'No match — <strong>prev</strong> and <strong>cur</strong> both step forward one node.', codeLines:CODE_DELETE, hiLine:13});
    guard++; if(guard>1000) break;
  }
  if(!found){
    steps.push({snapshot: snapshotNow(), highlight:[], desc:'<strong>cur</strong> is now null, so the loop ends — we walked off the end of the list.', codeLines:CODE_DELETE, hiLine:14});
    steps.push({snapshot: snapshotNow(), desc:'<strong>'+val+'</strong> was never found. The list is returned unchanged.', codeLines:CODE_DELETE, hiLine:15});
  }
  return steps;
}

const CODE_SEARCH = [
  'bool search(Node* head, int value) {',
  '  Node* cur = head;',
  '  while (cur != nullptr) {',
  '    if (cur->value == value) {',
  '      return true;',
  '    }',
  '    cur = cur->next;',
  '  }',
  '  return false;',
  '}'
];
function buildSearchSteps(val){
  const steps = [];
  steps.push({snapshot: snapshotNow(), highlight:[], desc:'Searching for <strong>'+val+'</strong>.', codeLines:CODE_SEARCH, hiLine:0});
  let cur = headId, guard=0, found=false;
  steps.push({snapshot: snapshotNow(), highlight: cur?[cur]:[], desc:'<strong>cur</strong> starts at head. We can only follow arrows — no shortcuts.', codeLines:CODE_SEARCH, hiLine:1});
  while(cur!==null){
    const cn = findNode(cur);
    steps.push({snapshot: snapshotNow(), highlight:[cur], desc:'<strong>cur</strong> is not null, so the loop continues.', codeLines:CODE_SEARCH, hiLine:2});
    steps.push({snapshot: snapshotNow(), highlight:[cur], desc:'Is <strong>'+cn.value+'</strong> equal to '+val+'?', codeLines:CODE_SEARCH, hiLine:3});
    if(cn.value===val){
      found=true;
      steps.push({snapshot: snapshotNow(), foundId:cur, desc:'Match — found it! The function returns true.', codeLines:CODE_SEARCH, hiLine:4});
      break;
    }
    cur = cn.next;
    steps.push({snapshot: snapshotNow(), highlight: cur? [cur]:[], desc:'Not a match. <strong>cur</strong> steps forward to the next node.', codeLines:CODE_SEARCH, hiLine:6});
    guard++; if(guard>1000) break;
  }
  if(!found){
    steps.push({snapshot: snapshotNow(), highlight:[], desc:'<strong>cur</strong> is now null — the loop ends. The function returns false.', codeLines:CODE_SEARCH, hiLine:8});
  }
  return steps;
}

const CODE_REVERSE = [
  'Node* reverse(Node* head) {',
  '  Node* prev = nullptr;',
  '  Node* cur = head;',
  '  while (cur != nullptr) {',
  '    Node* nextNode = cur->next;',
  '    cur->next = prev;',
  '    prev = cur;',
  '    cur = nextNode;',
  '  }',
  '  head = prev;',
  '  return head;',
  '}'
];
function buildReverseSteps(){
  const steps = [];
  steps.push({snapshot: snapshotNow(), desc:'To reverse, we walk the list once and flip every <strong>next</strong> pointer to point backward.', codeLines:CODE_REVERSE, hiLine:0});
  let prev = null, cur = headId, guard=0;
  steps.push({snapshot: snapshotNow(), desc:'<strong>prev</strong> starts at null — nothing comes before the first node yet.', codeLines:CODE_REVERSE, hiLine:1});
  steps.push({snapshot: snapshotNow(), highlight: cur?[cur]:[], desc:'<strong>cur</strong> starts at head.', codeLines:CODE_REVERSE, hiLine:2});
  while(cur!==null){
    const curNode = findNode(cur);
    steps.push({snapshot: snapshotNow(), highlight:[cur], desc:'<strong>cur</strong> is not null, so the loop continues.', codeLines:CODE_REVERSE, hiLine:3});
    const nextNode = curNode.next;
    steps.push({snapshot: snapshotNow(), highlight:[cur], desc:'Save <strong>'+curNode.value+'</strong>.next in a temp variable first — otherwise we\'d lose the rest of the list once we overwrite it.', codeLines:CODE_REVERSE, hiLine:4});
    curNode.next = prev;
    steps.push({snapshot: snapshotNow(), highlight: prev? [cur,prev]: [cur], arrowHighlight: prev? [[cur,prev]]:[], desc: prev? ('<strong>'+curNode.value+'</strong>.next now points backward to the previous node.') : ('<strong>'+curNode.value+'</strong> becomes the new tail — its next is now null.'), codeLines:CODE_REVERSE, hiLine:5});
    prev = cur;
    steps.push({snapshot: snapshotNow(), highlight:[prev], desc:'<strong>prev</strong> moves up to '+curNode.value+'.', codeLines:CODE_REVERSE, hiLine:6});
    cur = nextNode;
    steps.push({snapshot: snapshotNow(), highlight: cur?[prev,cur]:[prev], desc: cur ? '<strong>cur</strong> moves up to the node we saved in the temp variable.' : '<strong>cur</strong> becomes null — we\'ve reached the end.', codeLines:CODE_REVERSE, hiLine:7});
    guard++; if(guard>1000) break;
  }
  steps.push({snapshot: snapshotNow(), highlight:[prev], desc:'<strong>cur</strong> is null, so the loop ends.', codeLines:CODE_REVERSE, hiLine:3});
  headId = prev;
  steps.push({snapshot: snapshotNow(), highlight:[headId], desc:'<strong>head</strong> is reassigned to what used to be the last node.', codeLines:CODE_REVERSE, hiLine:9});
  steps.push({snapshot: snapshotNow(), highlight:[headId], desc:'The function returns the reversed list — same nodes, flipped arrows.', codeLines:CODE_REVERSE, hiLine:10});
  return steps;
}