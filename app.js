import { algorithms } from './algorithms.js';

document.addEventListener('DOMContentLoaded', () => {
    // Constants and data
    const consonants = ['b', 'f', 'l', 'n'];
    const vowels = ['a', 'e', 'i', 'o'];

    let selectedOrder = [];
    let targetWords = [];
    let syllablesRow = consonants.flatMap(c => vowels.map(v => c + v));
    let syllablesCol = consonants.flatMap(c => vowels.map(v => c + v));
    let highlightMode = 'all'; // Default mode


    // Create Syllable Table
    function createSyllableTable() {
        const table = document.getElementById('syllableTable');

        // Create header
        const headerRow = table.insertRow();
        headerRow.insertCell();
        vowels.forEach(v => {
            const th = document.createElement('th');
            th.textContent = v;
            headerRow.appendChild(th);
        });

        // Create rows
        consonants.forEach(c => {
            const row = table.insertRow();
            const headerCell = document.createElement('th');
            headerCell.textContent = c;
            row.appendChild(headerCell);

            vowels.forEach(v => {
                const cell = row.insertCell();
                const syllable = c + v;
                cell.textContent = syllable;
                cell.dataset.syllable = syllable;
                cell.dataset.highlighted = false;
                cell.classList.add('clickable-syllable');

                // Add order badge
                const badge = document.createElement('div');
                badge.className = 'syllable-order';
                cell.appendChild(badge);
            });
        });
    }

    // Create Words Table
    function updateWordsTable(rowList = syllablesRow, colList = syllablesCol) {
        const table = document.getElementById('wordsTable');
        table.replaceChildren(); // Clear previous content
        // Create header
        const headerRow = table.insertRow();
        headerRow.insertCell();
        colList.forEach(s => {
            const th = document.createElement('th');
            th.textContent = s;
            th.dataset.syllable = s;
            headerRow.appendChild(th);
        });

        // Create rows
        rowList.forEach(rowSyllable => {
            const row = table.insertRow();
            const headerCell = document.createElement('th');
            headerCell.textContent = rowSyllable;
            row.appendChild(headerCell);

            colList.forEach(colSyllable => {
                const cell = row.insertCell();
                // const word = rowSyllable + colSyllable;

                // Split word into two syllables
                const firstPart = document.createElement('span');
                firstPart.textContent = rowSyllable;
                firstPart.dataset.syllable = rowSyllable;

                const secondPart = document.createElement('span');
                secondPart.textContent = colSyllable;
                secondPart.dataset.syllable = colSyllable;

                cell.appendChild(firstPart);
                cell.appendChild(secondPart);
            });
        });
    }

    function resetAndSelectSyllables(newOrder) {
        const newOrderCopy = [...newOrder]
        selectedOrder.length = 0;

        document.querySelectorAll('#syllableTable td[data-syllable]').forEach(cell => {
            cell.classList.remove('selected');
        });

        if (newOrderCopy && newOrderCopy.length > 0) {
            selectedOrder.push(...newOrderCopy);

            // Add 'selected' class to all elements with syllables in the newOrder
            newOrderCopy.forEach(syllable => {
                document.querySelectorAll(`[data-syllable="${syllable}"]`).forEach(el => {
                    el.classList.add('selected');
                });
            });
        }

        updateSelectedOrder();
    }


    // Add this function to update both the component and badges
    function updateSelectedOrder() {
        // Update the draggable component
        const container = document.getElementById('selectedSyllables');
        container.replaceChildren(); // Clear previous content

        selectedOrder.forEach((syllable, index) => {
            // Create main container
            const draggableDiv = document.createElement('div');
            draggableDiv.className = 'draggable-syllable';
            draggableDiv.draggable = true;
            draggableDiv.dataset.syllable = syllable;

            // Create text node for syllable
            const textNode = document.createTextNode(syllable);

            // Create order badge
            const orderBadge = document.createElement('div');
            orderBadge.className = 'order-badge';
            orderBadge.textContent = index + 1;

            // Assemble elements
            draggableDiv.appendChild(textNode);
            draggableDiv.appendChild(orderBadge);

            container.appendChild(draggableDiv);
        });

        // Update table badges
        document.querySelectorAll('#syllableTable td').forEach(cell => {
            const badge = cell.querySelector('.syllable-order');
            if (!badge) return; // Add null check here
            if (cell.classList.contains('selected')) {
                const index = selectedOrder.indexOf(cell.dataset.syllable);
                badge.textContent = index !== -1 ? index + 1 : '';
                badge.style.display = index !== -1 ? 'flex' : 'none';
            } else {
                // Hide badge if cell is deselected
                badge.style.display = 'none';
                badge.textContent = '';
            }
        });
    }


    // Helper para criar um div arrastável
    function createDraggableSyllable(s) {
        const div = document.createElement('div');
        div.className = 'draggable-syllable';
        div.draggable = true;
        div.dataset.syllable = s;
        div.textContent = s;
        div.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', s);
        });
        return div;
    }

    // Preenche os dois containers com os arrays atuais
    function populateCustomLists() {
        const rowC = document.getElementById('syllablesRowContainer');
        const colC = document.getElementById('syllablesColContainer');
        rowC.innerHTML = '';
        colC.innerHTML = '';
        syllablesRow.forEach(s => rowC.appendChild(createDraggableSyllable(s)));
        syllablesCol.forEach(s => colC.appendChild(createDraggableSyllable(s)));
    }

    // Trata drop em cada container
    function handleCustomDrop(type) {
        return function(e) {
        e.preventDefault();
        const dragged = e.dataTransfer.getData('text/plain');
        const targetEl = e.target.closest('.draggable-syllable');
        if (!targetEl) return;
        const list = type === 'row' ? syllablesRow : syllablesCol;
        const from = list.indexOf(dragged);
        const to = list.indexOf(targetEl.dataset.syllable);
        if (from > -1 && to > -1 && from !== to) {
            list.splice(from, 1);
            list.splice(to, 0, dragged);
            populateCustomLists();
            updateWordsTable();
            resetAndSelectSyllables(selectedOrder);
            updateWordCellsBackground(); // re-aplica highlights/protocol
        }
        };
    }

    function updateProtocolTable() {
        const cycles_input = document.getElementById('cycles');
        const wordsPerCycle_input = document.getElementById('wordsPerCycle');

        switch (highlightMode) {
            case 'hanna':
                cycles_input.value = 6;
                wordsPerCycle_input.value = 2;
                break;
            default:
                // do nothing
                break;
        }

        let cycles = parseInt(cycles_input.value, 10);
        let wordsPerCycle = parseInt(wordsPerCycle_input.value, 10);

        const protocolTable = document.getElementById('protocolTable');

        // Clear existing content
        protocolTable.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Cycle</th>';
        for (let i = 1; i <= wordsPerCycle; i++) {
            headerRow.innerHTML += `<th>Word ${i}</th>`;
        }
        protocolTable.appendChild(headerRow);

        // Split targetWords into chunks
        const wordChunks = [];
        for (let i = 0; i < targetWords.length; i += wordsPerCycle) {
            wordChunks.push(targetWords.slice(i, i + wordsPerCycle));
        }

        // Create rows for each cycle
        for (let cycle = 0; cycle < cycles; cycle++) {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${cycle + 1}</td>`;

            const currentChunk = wordChunks[cycle] || [];
            for (let i = 0; i < wordsPerCycle; i++) {
                const word = currentChunk[i] || '';
                const cell = document.createElement('td');
                cell.textContent = word;
                if (word) cell.classList.add('highlight');
                row.appendChild(cell);
            }
            protocolTable.appendChild(row);
        }
    }


    // Add drag and drop handlers
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.syllable);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggedSyllable = e.dataTransfer.getData('text/plain');
        const targetSyllable = e.target.closest('.draggable-syllable')?.dataset.syllable;

        if (targetSyllable && draggedSyllable !== targetSyllable) {
            const oldIndex = selectedOrder.indexOf(draggedSyllable);
            const newIndex = selectedOrder.indexOf(targetSyllable);

            // Swap positions
            [selectedOrder[oldIndex], selectedOrder[newIndex]] =
            [selectedOrder[newIndex], selectedOrder[oldIndex]];

            updateSelectedOrder();
        }
    }

    function updateWordCellsBackground() {
        const mode = highlightMode;

        targetWords.length = 0;
        targetWords.push(...algorithms[mode]?.(selectedOrder) || []);

        resetAndSelectSyllables(selectedOrder);

        const targetWordsWasEmpty = targetWords.length === 0;

        document.querySelectorAll('#wordsTable td').forEach(cell => {
            const syllables = cell.querySelectorAll('span[data-syllable]');
            if (syllables.length !== 2) return;
            const [s1, s2] = Array.from(syllables);

            let shouldHighlight = false;

            switch(mode) {
                case 'all':
                    shouldHighlight = s1.classList.contains('selected') ||
                                    s2.classList.contains('selected');
                    break;

                case 'both':
                    shouldHighlight = s1.classList.contains('selected') &&
                                    s2.classList.contains('selected');
                    break;

                case 'different':
                    shouldHighlight = s1.classList.contains('selected') &&
                                    s2.classList.contains('selected') &&
                                    s1.dataset.syllable !== s2.dataset.syllable;
                    break;

                case 'different-consonants':
                    shouldHighlight = s1.classList.contains('selected') &&
                                    s2.classList.contains('selected') &&
                                    s1.dataset.syllable[0] !== s2.dataset.syllable[0];
                    break;

                case 'different-vowels':
                    shouldHighlight = s1.classList.contains('selected') &&
                                    s2.classList.contains('selected') &&
                                    s1.dataset.syllable[1] !== s2.dataset.syllable[1];
                    break;

                case 'isograms':
                    shouldHighlight = s1.classList.contains('selected') &&
                                    s2.classList.contains('selected') &&
                                    s1.dataset.syllable[0] !== s2.dataset.syllable[0] &&
                                    s1.dataset.syllable[1] !== s2.dataset.syllable[1];
                    break;

                case 'hanna':
                case 'hanna_generalized':
                    shouldHighlight = targetWords.includes(s1.dataset.syllable + s2.dataset.syllable);
                    break;
            }

            if (targetWordsWasEmpty) {
                if (shouldHighlight) targetWords.push(cell.textContent);
            };

            cell.classList.toggle('highlight', shouldHighlight);
        });
        updateProtocolTable();
    }

    function handleCustomOrderToggle(e) {
        const container = document.getElementById('customOrderContainer');
        const isCustomOrder = e.target.checked;

        container.style.display = isCustomOrder ? '' : 'none';

        // Reset syllables to default
        syllablesRow = consonants.flatMap(c => vowels.map(v => c + v));
        syllablesCol = consonants.flatMap(c => vowels.map(v => c + v));

        if (isCustomOrder) {
            populateCustomLists();
        } else {
            updateWordsTable();
            if (selectedOrder.length !== 0) {
                resetAndSelectSyllables(selectedOrder);
            }
            updateWordCellsBackground();
        }
    }

    function handleBodyClick(e) {
        const target = e.target;
        if (target.classList.contains('order-badge')) return;

        // Prevent modifications in certain modes
        if (['hanna'].includes(highlightMode)) {
            return;
        }

        let syllableElement = target.closest('[data-syllable]');

        if (syllableElement) {
            const syllable = syllableElement.dataset.syllable;
            const isSelected = syllableElement.classList.contains('selected');

            // Only allow changes if not in restricted mode
            document.querySelectorAll(`[data-syllable="${syllable}"]`).forEach(el => {
                el.classList.toggle('selected', !isSelected);
            });

            const index = selectedOrder.indexOf(syllable);
            if (!isSelected) {
                if (index === -1) selectedOrder.push(syllable);
            } else {
                if (index !== -1) selectedOrder.splice(index, 1);
            }

            updateSelectedOrder();
            updateWordCellsBackground();
        }
    }

    // Initialize tables
    createSyllableTable();
    updateWordsTable();

    document.body.addEventListener('click', handleBodyClick);

    // Highlight mode selection
    document.getElementById('highlightMode').addEventListener('change', (e) => {
        highlightMode = e.target.value;
        updateWordCellsBackground();
    });

    // Syllable drag and drop
    const selectedSyllables = document.getElementById('selectedSyllables');
    selectedSyllables.addEventListener('dragstart', handleDragStart);
    selectedSyllables.addEventListener('dragover', handleDragOver);
    selectedSyllables.addEventListener('drop', handleDrop);

    // Protocol table controls
    document.getElementById('cycles').addEventListener('input', updateProtocolTable);
    document.getElementById('wordsPerCycle').addEventListener('input', updateProtocolTable);

    // Custom order toggle
    const customOrderToggle = document.getElementById('customOrderToggle');
    customOrderToggle.addEventListener('change', handleCustomOrderToggle);

    // Custom order containers drag and drop
    const rowContainer = document.getElementById('syllablesRowContainer');
    const colContainer = document.getElementById('syllablesColContainer');

    [rowContainer, colContainer].forEach((container, index) => {
        container.addEventListener('dragover', (e) => e.preventDefault());
        container.addEventListener('drop', handleCustomDrop(index === 0 ? 'row' : 'col'));
    });

});