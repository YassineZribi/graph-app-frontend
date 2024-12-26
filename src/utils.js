export function getTotalPathDistance(selectedEdges = []) {
    let total = 0
    selectedEdges.forEach(edge => total += Number(edge.label))
    return total ? total : "-"
}

export function formatPath(nodes) {
    if (!nodes || nodes.length === 0) {
        return '-';
    }
    return nodes.map(node => `<b>${node.label}</b>`).join('<span>&#8594;</span>');
}

export const NAVBAR_HEIGHT = parseInt(getComputedStyle(document.getElementsByClassName("navbar")?.[0])?.height)