let inputId = 0;
let gondoleData = {};

window.onload = function () {
    if (localStorage.getItem("gondoleData")) {
        gondoleData = JSON.parse(localStorage.getItem("gondoleData"));
        updateGondoleDataList();
    }
    addInput();
};

function addInput() {
    const container = document.getElementById('input-container');
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    inputGroup.id = `input-group-${inputId}`;

    inputGroup.innerHTML = `
        <input type="text" id="name-${inputId}" placeholder="Nom" />
        <input type="number" id="length-${inputId}" placeholder="Longueur(cm)" />
        <input type="number" id="quantity-${inputId}" placeholder="Quantité" />
        <button class="add" onclick="saveData(${inputId})">Valider</button>
        <button class="remove" onclick="removeInput(${inputId})">Supprimer</button>`;

    container.appendChild(inputGroup);
    inputId++;
}

function removeInput(id) {
    const inputGroup = document.getElementById(`input-group-${id}`);
    inputGroup.remove();
    calculateTotalGeneral();
}

function saveData(id) {
    const name = document.getElementById(`name-${id}`).value || `Gondole ${id}`;
    const length = parseFloat(document.getElementById(`length-${id}`).value);
    const quantity = parseFloat(document.getElementById(`quantity-${id}`).value);

    if (length && quantity) {
        const totalLength = length * quantity;
        const key = name + "_" + length;
        if (!gondoleData[key]) {
            gondoleData[key] = { name: name, length: length, totalLength: 0, totalQuantity: 0, quantities: [] };
        }
        gondoleData[key].totalLength += totalLength;
        gondoleData[key].totalQuantity += quantity;
        gondoleData[key].quantities.push(quantity);
        localStorage.setItem("gondoleData", JSON.stringify(gondoleData));

        updateGondoleDataList();
        document.getElementById(`quantity-${id}`).value = '';
    }
}

function updateGondoleDataList() {
    const list = document.getElementById('saved-totals');
    list.innerHTML = '';
    Object.keys(gondoleData).forEach(key => {
        const totalLengthInMeters = gondoleData[key].totalLength / 100;

        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion('${key}')">
                ${gondoleData[key].name} (${gondoleData[key].length} cm): ${totalLengthInMeters.toFixed(2)} m, Quantité Totale = ${gondoleData[key].totalQuantity}
            </div>
            <div class="accordion-content" id="accordion-${key}">
                <ul id="history-${key}"></ul>
            </div>
        `;

        list.appendChild(accordionItem);

        const historyList = document.getElementById(`history-${key}`);
        gondoleData[key].quantities.forEach((quantity, index) => {
            const historyItem = document.createElement('li');
            historyItem.innerText = `Quantité: ${quantity} `;

            const editButton = document.createElement('button');
            editButton.className = 'edit';
            editButton.innerText = 'Modifier';
            editButton.onclick = function () { editQuantity(key, index); };
            historyItem.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete';
            deleteButton.innerText = 'Suppr.';
            deleteButton.onclick = function () { deleteQuantity(key, index); };
            historyItem.appendChild(deleteButton);

            historyList.appendChild(historyItem);
        });
    });
}

function toggleAccordion(key) {
    const content = document.getElementById(`accordion-${key}`);
    content.style.display = content.style.display === "block" ? "none" : "block";
}

function editQuantity(key, index) {
    const historyList = document.getElementById(`history-${key}`);
    const historyItem = historyList.children[index];
    const currentQuantity = gondoleData[key].quantities[index];

    historyItem.innerHTML = `
        <input type="number" id="edit-quantity-${index}" value="${currentQuantity}" />
        <button onclick="saveEditedQuantity('${key}', ${index})">Sauvegarder</button>
    `;
}

function saveEditedQuantity(key, index) {
    const editedQuantityInput = document.getElementById(`edit-quantity-${index}`);
    const newQuantity = parseFloat(editedQuantityInput.value);

    // Mise à jour de la quantité et recalcul du total pour cette gondole
    gondoleData[key].quantities[index] = newQuantity;
    const totalLengthForGondole = gondoleData[key].quantities.reduce((total, qty) => total + gondoleData[key].length * qty, 0);
    gondoleData[key].totalLength = totalLengthForGondole;
    gondoleData[key].totalQuantity = gondoleData[key].quantities.reduce((total, qty) => total + qty, 0);

    // Sauvegarder les nouvelles données dans localStorage
    localStorage.setItem("gondoleData", JSON.stringify(gondoleData));

    // Recalculer et afficher le total général
    calculateTotalGeneral();

    // Mise à jour de l'affichage de l'historique
    updateGondoleDataList();
}

function deleteQuantity(key, index) {
    gondoleData[key].quantities.splice(index, 1);
    gondoleData[key].totalQuantity = gondoleData[key].quantities.reduce((total, qty) => total + qty, 0);
    gondoleData[key].totalLength = gondoleData[key].length * gondoleData[key].totalQuantity;
    localStorage.setItem("gondoleData", JSON.stringify(gondoleData));
    updateGondoleDataList();
}

function calculateTotalGeneral() {
    // let totalGeneralInCm = 0;
    // Object.values(gondoleData).forEach(data => totalGeneralInCm += data.totalLength);
    // const totalGeneralInMeters = totalGeneralInCm / 100;
    // document.getElementById('total-general').innerText = `${totalGeneralInCm} cm (${totalGeneralInMeters.toFixed(2)} m)`;
}

function clearCache() {
    if (confirm("Voulez-vous vraiment supprimer tout le cache?")) {
        localStorage.clear();
        location.reload();
    }
}
