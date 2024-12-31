import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

import { DataSet, Network } from 'vis-network/standalone'
import * as bootstrap from 'bootstrap'
import notyf from '../notyf-config'
import { formatPath, getTotalPathDistance, NAVBAR_HEIGHT } from '../utils'
import graphService from '../services/graphService'
import dijekstraService from '../services/dijekstraService'
import { applyPointsBackground, applyRectanglesBackground } from './network-background'
import { showConfirmationModal } from '../confirmation-modal'


const nodes = new DataSet();
const edges = new DataSet();

let selectedNodeId = null;
let selectedEdgeId = null;
let lastClickPosition = { x: 0, y: 0 };

// Dijekstra
let startNode = null;
let endNode = null;

const container = document.getElementById('network');
const data = { nodes, edges };
const options = { /* physics: false, interaction: { dragNodes: true }, */ interaction: { zoomView: true }, edges: { smooth: true } };
const network = new Network(container, data, options);

function zoomIn() {
  network.moveTo({
    scale: network.getScale() * 1.2
  });
}

document.getElementById("zoomInBtn").addEventListener("click", zoomIn)

function zoomOut() {
  network.moveTo({
    scale: network.getScale() * 0.8
  });
}

document.getElementById("zoomOutBtn").addEventListener("click", zoomOut)

network.on('wheel', (params) => {
  if (params.event.deltaY < 0) { // deltaY < 0: Zoom in on scroll up.
    zoomIn();
  } else { // deltaY > 0: Zoom out on scroll down.
    zoomOut();
  }
});

// applyPointsBackground(network)

// ✅ Gestion du Double-Clic
network.on('doubleClick', (params) => {
  console.log(params)
  console.log(params.nodes)
  console.log(params.edges)

  if (params.nodes.length == 0 && params.edges.length == 0) { // Clicked on an empty area
    lastClickPosition = params.pointer.canvas;
    const addPopover = document.getElementById('addPopover');
    addPopover.style.left = `${params.pointer.DOM.x}px`;
    addPopover.style.top = `${params.pointer.DOM.y + NAVBAR_HEIGHT}px`;
    addPopover.style.display = 'block';
    document.getElementById('addNodeLabel').focus()
  } else if (params.nodes.length == 0 && params.edges.length > 0) { // Clicked on an edge
    // ✅ Gérer le Double-Clic sur un Lien (Edge)
    selectedEdgeId = params.edges[0];
    const edge = edges.get(selectedEdgeId);
    const position = params.pointer.DOM;

    const editEdgePopover = document.getElementById('editEdgePopover');
    editEdgePopover.style.left = `${position.x}px`;
    editEdgePopover.style.top = `${position.y + NAVBAR_HEIGHT}px`;
    editEdgePopover.style.display = 'block';

    document.getElementById('editEdgeLabel').value = edge.label || '';
  } else { // Clicked on a node (params.nodes.length > 0)
    selectedNodeId = params.nodes[0];
    const position = network.getPositions([selectedNodeId])[selectedNodeId];
    const canvasPosition = network.canvasToDOM(position);

    document.getElementById('editNodePopover').style.left = `${canvasPosition.x}px`;
    document.getElementById('editNodePopover').style.top = `${canvasPosition.y + NAVBAR_HEIGHT}px`;
    document.getElementById('editNodePopover').style.display = 'block';
    document.getElementById('editNodeLabel').value = nodes.get(selectedNodeId).label;
    populateLinkNodeSelect(selectedNodeId);
  }
});

// ✅ Modifier le Label du Lien
document.getElementById('editEdgeBtn').addEventListener('click', () => {
  const newLabel = document.getElementById('editEdgeLabel').value;
  edges.update({ id: selectedEdgeId, label: newLabel });
  closeEditEdgePopover();
});

// ✅ Confirmer et Supprimer le Lien
async function confirmDeleteEdgeCallback() {
  // Simulate an asynchronous operation, such as a backend request
  if (selectedEdgeId) {
    edges.remove(selectedEdgeId);
    return true // close modal
  }
  return false
}

document.getElementById('deleteEdgeBtn').addEventListener('click', () => {
  // ✅ Afficher le Modal de Confirmation avant la Suppression
  showConfirmationModal(
    "Êtes-vous sûr de vouloir supprimer ce lien ?",
    confirmDeleteEdgeCallback
  );
  closeEditEdgePopover();
});

// ✅ Ajouter un Nœud
document.getElementById('addNodeBtn').addEventListener('click', () => {
  const label = document.getElementById('addNodeLabel').value.trim();
  if (label.length > 2 || label === '' || nodes.get({ filter: (node) => node.label === label }).length > 0) {
    notyf.error('Label invalide ou déjà existant.');
    return;
  }
  nodes.add({ label, x: lastClickPosition.x, y: lastClickPosition.y });
  closeAddNodePopover();
});

// ✅ Modifier un Nœud
document.getElementById('editNodeBtn').addEventListener('click', () => {
  const label = document.getElementById('editNodeLabel').value;
  if (label.length > 2 || label === '' || nodes.get({ filter: (node) => node.label === label }).length > 0) {
    notyf.error('Label invalide ou déjà existant.');
    return;
  }
  // Mettre à jour le nœud
  nodes.update({ id: selectedNodeId, label });

  // Mettre à jour les arêtes liées au nœud modifié
  const connectedEdges = edges.get().filter(edge => edge.from === selectedNodeId || edge.to === selectedNodeId);
  connectedEdges.forEach(edge => {
    if (edge.from === selectedNodeId) {
      edge.from = selectedNodeId; // ID reste le même, mais on peut ajouter des mises à jour si nécessaire
    }
    if (edge.to === selectedNodeId) {
      edge.to = selectedNodeId; // ID reste le même, mais on peut ajouter des mises à jour si nécessaire
    }
    edges.update(edge);
  });

  closeEditNodePopover()
  console.log(nodes.get());
  console.log(edges.get());
});

// ✅ Confirmer et Supprimer le Nœud
async function confirmDeleteNodeCallback() {
  if (selectedNodeId) {
    // Supprimer le noeud
    nodes.remove(selectedNodeId);

    // Supprimer les arêtes liées au noeud
    const edgesToRemove = edges.get().filter(edge => edge.from === selectedNodeId || edge.to === selectedNodeId);
    edgesToRemove.forEach(edge => edges.remove(edge.id));

    console.log(nodes.get())
    console.log(edges.get())

    return true // close modal
  }
  return false
}

document.getElementById('deleteNodeBtn').addEventListener('click', () => {
  // ✅ Afficher le Modal de Confirmation avant la Suppression
  showConfirmationModal(
    "Êtes-vous sûr de vouloir supprimer ce nœud ?",
    confirmDeleteNodeCallback
  );
  closeEditNodePopover();
});

// ✅ Confirmer et Supprimer le Graphe
async function confirmDeleteGraphCallback() {
  let closeModal = false;
  try {
    const res = await graphService.deleteGraph()
    console.log('Success:', res);
    notyf.success("Graph deleted successfully!")
    closeModal = true // close modal
  } catch (error) {
    console.error('Error:', error);
    if (error.response.status === 404) {
      closeModal = true
    }
    // closeModal = false
  } finally {
    nodes.clear();
    edges.clear();
    return closeModal
  }
}

document.getElementById('deleteGraphBtn').addEventListener('click', () => {
  if (nodes.get().length == 0) {
    notyf.error('No graph to delete!');
    return;
  }
  // ✅ Afficher le Modal de Confirmation avant la Suppression
  showConfirmationModal(
    "Êtes-vous sûr de vouloir supprimer ce graphe ?",
    confirmDeleteGraphCallback
  );
});

// ✅ Lier Deux Nœuds
document.getElementById('createEdgeBtn').addEventListener('click', () => {
  const targetNode = document.getElementById('linkNodeSelect').value;
  const label = document.getElementById('edgeLabel').value;
  const isDirected = document.getElementById('isDirectedEdge').checked;

  if (!targetNode || label === '') {
    notyf.error('Veuillez remplir les champs.');
    return;
  }

  edges.add({ from: selectedNodeId, to: targetNode, label, arrows: isDirected ? 'to' : '', /*color: { color: 'green' }*/ });
  console.log(edges.get());

  closeEditNodePopover()
});

// ✅ Fermer les popovers en cliquant à l'extérieur
document.addEventListener('click', (e) => {
  if (!e.target.closest('.popover') && !e.target.closest('.vis-network')) {
    closeEditNodePopover();
    closeEditEdgePopover();
    closeAddNodePopover();
  }
});

// ✅ Mettre à jour les sélecteurs lorsqu'ils sont ouverts
function updateNodeSelectOptions(selectElement) {
  selectElement.innerHTML = '<option value="">-</option>';

  nodes.forEach((node) => {
    const option = document.createElement('option');
    option.value = node.id;
    option.text = node.label;
    selectElement.appendChild(option);
  });
}

// ✅ Écouter l'ouverture des sélecteurs
document.getElementById('startNodeSelect').addEventListener('focus', () => {
  updateNodeSelectOptions(document.getElementById('startNodeSelect'));
});

document.getElementById('endNodeSelect').addEventListener('focus', () => {
  updateNodeSelectOptions(document.getElementById('endNodeSelect'));
});

// ✅ Mettre à jour les variables lors du changement des sélecteurs
document.getElementById('startNodeSelect').addEventListener('change', (e) => {
  startNode = e.target.value || null;
});

document.getElementById('endNodeSelect').addEventListener('change', (e) => {
  endNode = e.target.value || null;
});

// ✅ Afficher les variables dans la console
document.getElementById('calculateDijekstraBtn').addEventListener('click', () => {
  console.log('Nœud de Départ:', startNode);
  console.log('Nœud d\'Arrivée:', endNode);

  const data = {
    graph: {
      nodes: nodes.get(),
      edges: edges.get()
    },
    startNode,
    endNode
  }

  if (data.graph.nodes.length == 0 || !startNode || !endNode) {
    notyf.error("Can't perform Dijekstra algorithm!")
    return
  }
  resetEdgesStyle();
  dijekstraService.calculateShortestPath(data)
    .then(res => {
      console.log('Success:', res.data);
      const selectedEdges = res.data.selectedEdges
      const selectedNodes = res.data.selectedNodes
      console.log(selectedNodes)
      document.getElementById("dijekstra-path").innerHTML = formatPath(selectedNodes)
      document.getElementById("dijekstra-distance").innerHTML = `<b>Total:</b> <span>${getTotalPathDistance(selectedEdges)}</span>`
      network.selectEdges([])
      network.selectNodes([])
      selectedEdges.forEach(edge => edges.update({ id: edge.id, color: { color: "#06D6A0" }, width: 3 }))
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

function resetDijekstraForm() {
  document.getElementById('startNodeSelect').value = '';
  document.getElementById('endNodeSelect').value = '';
  startNode = null;
  endNode = null;
  resetEdgesStyle()
  document.getElementById("dijekstra-path").innerHTML = ""
  document.getElementById("dijekstra-distance").innerHTML = ""
}

// ✅ Réinitialiser les sélecteurs et les variables avec le bouton Vider
document.getElementById('resetDijkstraBtn').addEventListener('click', resetDijekstraForm);

function closeDijekstraAccordion() {
  const accordion = new bootstrap.Collapse('#collapseDijkstra');
  accordion.hide();
}

// ✅ Fermer simplement l'accordion avec le bouton Fermer
document.getElementById('resetAndCloseDijkstraAccordionBtn').addEventListener('click', () => {
  resetDijekstraForm()
  closeDijekstraAccordion()
});

// ✅ Remplit le select avec les autres nœuds disponibles pour la liaison
function populateLinkNodeSelect(currentNodeId) {
  const select = document.getElementById('linkNodeSelect');
  select.innerHTML = '<option value="">-</option>'; // Réinitialiser le select

  nodes.forEach((node) => {
    if (node.id !== currentNodeId) {
      // Vérifier si une arête existe déjà entre les deux nœuds
      const edgeExists = edges.get({
        filter: (edge) => edge.arrows
          ? (edge.from === currentNodeId && edge.to === node.id)
          : ((edge.from === currentNodeId && edge.to === node.id) || (edge.to === currentNodeId && edge.from === node.id))
      }).length > 0;

      const option = document.createElement('option');
      option.value = node.id;
      option.text = node.label;
      option.disabled = edgeExists; // Désactiver si un lien existe déjà

      select.appendChild(option);
    }
  });

  // Afficher les détails du lien après sélection
  select.addEventListener('change', () => {
    const linkDetails = document.getElementById('linkDetails');
    if (select.value) {
      openLinkDetailsBlock()
    } else {
      closeLinkDetailsBlock()
    }
  });
}

function closeEditNodePopover() {
  document.getElementById('editNodePopover').style.display = 'none';

  closeLinkDetailsBlock()
}

document.getElementById('closeEditNodePopoverBtn').addEventListener('click', closeEditNodePopover);


function closeEditEdgePopover() {
  document.getElementById('editEdgePopover').style.display = 'none';
}

document.getElementById('closeEditEdgePopoverBtn').addEventListener('click', closeEditEdgePopover);


function closeAddNodePopover() {
  document.getElementById('addPopover').style.display = 'none';

  document.getElementById('addNodeLabel').value = ""
}

document.getElementById('closeAddNodePopoverBtn').addEventListener('click', closeAddNodePopover);


function openLinkDetailsBlock() {
  linkDetails.style.display = 'block';
}
function closeLinkDetailsBlock() {
  linkDetails.style.display = 'none';

  document.getElementById('edgeLabel').value = ""
  document.getElementById("isDirectedEdge").checked = false;
}

function resetEdgesStyle() {
  edges.get().forEach(edge => edges.update({ id: edge.id, color: {}, width: 1 }))
}

function showData() {
  const data = {
    nodes: nodes.get(),
    edges: edges.get()
  }
  console.log(JSON.stringify(data, null, 2))
}

document.getElementById('showLocalDataBtn').addEventListener('click', showData);

function saveGraph() {
  const graph = {
    nodes: nodes.get(),
    edges: edges.get()
  }

  if (graph.nodes.length == 0) {
    notyf.error("No graph available to save!")
    return
  }

  graphService.saveGraph(graph)
    .then(res => {
      console.log('Success:', res.data);
      notyf.success("Graph saved successfully!")
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

document.getElementById('saveGraphBtn').addEventListener('click', saveGraph);

function loadGraph() {
  graphService.loadGraph()
    .then(res => {
      console.log('Success:', res.data);
      nodes.clear();
      edges.clear();
      res.data.nodes.forEach(node => nodes.add({ id: node.id, label: node.label }))
      res.data.edges.forEach(edge => edges.add({ ...edge }))
      // nodes.add({ label, x: lastClickPosition.x, y: lastClickPosition.y });
      // edges.add({ from: selectedNodeId, to: targetNode, label, arrows: isDirected ? 'to' : '' });
    })
    .catch(error => {
      console.error('Error:', error);
      notyf.error(error.response.data.message)
    });
}

document.getElementById('loadGraphBtn').addEventListener('click', loadGraph);

function transformGraph() {
  const allNodes = nodes.get()
  const allEdges = edges.get()
  const transformedGraph = {}
  allNodes.forEach(node => {
    const neighbors = {}
    allEdges.forEach(edge => {
      if ((node.id == edge.from && edge.arrows == "to") || ((node.id == edge.from || node.id == edge.to) && edge.arrows != "to")) {
        neighbors[edge.to != node.id ? (allNodes.find(n => n.id == edge.to)?.label) : (allNodes.find(n => n.id == edge.from)?.label)] = Number(edge.label)
      }
    })
    transformedGraph[node.label] = neighbors
  })
  console.log(transformedGraph)
}

document.getElementById('transformGraphBtn').addEventListener('click', transformGraph);