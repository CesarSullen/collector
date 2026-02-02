//  Adding new input rows to the form
const addBetButtons = document.querySelectorAll(".btn-add-bet");

addBetButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const inputGroup = button.parentElement.querySelector(".input-group");

		const newInputRow = document.createElement("div");
		newInputRow.className = "inputs-row";

		newInputRow.innerHTML = `
            <input class="form-input" type="number" placeholder="Número" />
            <input class="form-input" type="number" placeholder="Monto $" />
        `;

		inputGroup.appendChild(newInputRow);
		newInputRow.querySelector("input").focus();
	});
});

//  Collecting data from the form
const mainAddBtn = document.getElementById("btn-main");
const clientNameInput = document.getElementById("client-name-input");
const betSections = document.querySelectorAll(".bet-section");

mainAddBtn.addEventListener("click", () => {
	const clientName = clientNameInput.value.trim();

	if (!clientName) {
		alert("Por favor, introduce el nombre del cliente.");
		return;
	}

	const newBetData = {
		client: clientName,
		time: new Date().toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		}),
		fixedBets: [],
		runningBets: [],
	};

	betSections.forEach((section) => {
		const sectionId = section.id;
		const rows = section.querySelectorAll(".inputs-row");

		rows.forEach((row) => {
			const inputs = row.querySelectorAll("input");
			const rawNumber = inputs[0].value;
			const amount = inputs[1].value;

			const formattedNumber = formatNumber(rawNumber);

			if (formattedNumber !== null && amount) {
				const betEntry = { number: formattedNumber, amount };

				if (sectionId === "fixed-bets-section") {
					newBetData.fixedBets.push(betEntry);
				} else if (sectionId === "running-bets-section") {
					newBetData.runningBets.push(betEntry);
				}
			} else if (rawNumber !== "" && formattedNumber === null) {
				alert(
					`El número "${rawNumber}" no es válido. Debe estar entre 0 y 99.`
				);
			}
		});
	});

	const hasBets =
		newBetData.fixedBets.length > 0 || newBetData.runningBets.length > 0;

	if (!hasBets) {
		alert("El cliente debe tener al menos una apuesta (Fija o Corrida).");
		return;
	}

	allBets.push(newBetData);
	renderBetItem(newBetData);
	updateSummary();
	saveToLocalStorage();
	resetForm();
});

function formatNumber(num) {
	if (num === "") return null;

	let val = parseInt(num, 10);

	if (isNaN(val) || val < 0 || val > 99) {
		return null;
	}

	return val.toString().padStart(2, "0");
}

function resetForm() {
	clientNameInput.value = "";

	betSections.forEach((section) => {
		const inputGroup = section.querySelector(".input-group");
		const rows = inputGroup.querySelectorAll(".inputs-row");

		//  Cleaning the first row
		const firstRowInputs = rows[0].querySelectorAll("input");
		firstRowInputs.forEach((input) => (input.value = ""));

		//  Deleting the rest
		for (let i = 1; i < rows.length; i++) {
			rows[i].remove();
		}
	});
}

//  Render clients list
const listContainer = document.querySelector(".list-container");

function renderBetItem(betData) {
	const listItem = document.createElement("div");
	listItem.className = "list-item";

	const fixedBetsHTML = betData.fixedBets
		.map(
			(bet) =>
				`<span class="bet-item">${bet.number} <strong>$${bet.amount}</strong></span>`
		)
		.join("");

	const runningBetsHTML = betData.runningBets
		.map(
			(bet) =>
				`<span class="bet-item">${bet.number} <strong>$${bet.amount}</strong></span>`
		)
		.join("");

	listItem.innerHTML = `
        <div class="item-header">
            <div class="client-info">
                <strong class="client-name">${betData.client}</strong>
                <span class="client-bet-time">${betData.time}</span>
            </div>
            <button class="btn-delete">
                <img src="./assets/icons/trash.svg" />
            </button>
        </div>
        <div class="item-content">
            ${
							betData.fixedBets.length > 0
								? `
                <div class="bets-container">
                    <span>Fijos:</span>
                    ${fixedBetsHTML}
                </div>`
								: ""
						}
            
            ${
							betData.runningBets.length > 0
								? `
                <div class="bets-container">
                    <span>Corridos:</span>
                    ${runningBetsHTML}
                </div>`
								: ""
						}
        </div>
    `;

	if (listContainer.children.length > 0) {
		const divider = document.createElement("div");
		divider.className = "list-divider";
		listContainer.appendChild(divider);
	}

	listContainer.appendChild(listItem);
}

//  Functionality for btn-delete
listContainer.addEventListener("click", (event) => {
	// Check if the click was on the delete button or its icon
	const deleteBtn = event.target.closest(".btn-delete");

	if (deleteBtn) {
		const itemToDelete = deleteBtn.closest(".list-item");

		const allItems = Array.from(listContainer.querySelectorAll(".list-item"));
		const index = allItems.indexOf(itemToDelete);

		if (index > -1) {
			allBets.splice(index, 1); // Remove from data
		}

		itemToDelete.remove();

		const nextDivider = itemToDelete.nextElementSibling;
		const prevDivider = itemToDelete.previousElementSibling;

		// Remove the next divider
		if (nextDivider && nextDivider.classList.contains("list-divider")) {
			nextDivider.remove();
		}
		// Remove the previous divider
		else if (prevDivider && prevDivider.classList.contains("list-divider")) {
			prevDivider.remove();
		}
	}

	updateSummary();
	saveToLocalStorage();
});

//	Functionality for clear-btn
const clearBtn = document.getElementById("btn-clear");

clearBtn.addEventListener("click", () => {
	const confirmClear = confirm(
		"¿Estás seguro de que quieres borrar TODA la lista actual? Esta acción no se puede deshacer."
	);

	if (confirmClear) {
		allBets = [];
		listContainer.innerHTML = "";

		updateSummary();
		saveToLocalStorage();
	}
});

//  Updating the summary cards
const totalFixedEl = document.getElementById("total-fixed");
const totalRunningEl = document.getElementById("total-running");
const totalCombinedEl = document.getElementById("total-combined");

let allBets = [];

function updateSummary() {
	let totalFixed = 0;
	let totalRunning = 0;

	allBets.forEach((betData) => {
		// Sum fixed bets
		betData.fixedBets.forEach((bet) => {
			totalFixed += parseFloat(bet.amount) || 0;
		});

		// Sum running bets
		betData.runningBets.forEach((bet) => {
			totalRunning += parseFloat(bet.amount) || 0;
		});
	});

	totalFixedEl.textContent = `$${totalFixed.toLocaleString()}`;
	totalRunningEl.textContent = `$${totalRunning.toLocaleString()}`;
	totalCombinedEl.textContent = `$${(
		totalFixed + totalRunning
	).toLocaleString()}`;
}

//	Functionality for send-btn
const sendDataBtn = document.getElementById("btn-send");

sendDataBtn.addEventListener("click", async () => {
	if (allBets.length === 0) {
		alert("No hay apuestas para enviar.");
		return;
	}

	const collectorName =
		collectorNameSpan.textContent.trim() || "recolector_desconocido";
	const dateStr = new Date().toISOString().slice(0, 10);
	const exportData = {
		meta: {
			collector: collectorName,
			date: new Date().toLocaleString(),
			totalFixed: totalFixedEl.textContent,
			totalRunning: totalRunningEl.textContent,
			totalAmount: totalCombinedEl.textContent,
		},
		data: allBets,
	};

	//	Setting the file
	const jsonString = JSON.stringify(exportData, null, 2);
	const fileName = `lista_${collectorName}_${dateStr}.json`;
	const blob = new Blob([jsonString], { type: "application/json" });

	// Fallback: Download
	const downloadFile = () => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// Web Share API
	if (navigator.share && navigator.canShare) {
		const file = new File([blob], fileName, { type: "application/json" });
		const shareData = {
			files: [file],
			title: `Lista de ${collectorName}`,
			text: `Archivo de apuestas - ${dateStr}`,
		};

		if (navigator.canShare(shareData)) {
			try {
				await navigator.share(shareData);
				return;
			} catch (err) {
				if (err.name !== "AbortError") {
					downloadFile();
				}
				return;
			}
		}
	}
	downloadFile();
});

//	Save and Load data
const collectorNameSpan = document.getElementById("collector-name");

collectorNameSpan.addEventListener("blur", () => {
	saveToLocalStorage();
});

function saveToLocalStorage() {
	const dataToSave = {
		collector: collectorNameSpan.textContent.trim(),
		bets: allBets,
	};
	localStorage.setItem("collector_app_data", JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
	const savedData = localStorage.getItem("collector_app_data");

	if (savedData) {
		const parsedData = JSON.parse(savedData);

		collectorNameSpan.textContent = parsedData.collector || "Nombre";

		allBets = parsedData.bets || [];
		allBets.forEach((bet) => renderBetItem(bet));
		updateSummary();
	}
}

loadFromLocalStorage();

//	Service Worker
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.then((reg) =>
				console.log("Service Worker registrado con éxito", reg.scope)
			)
			.catch((err) =>
				console.error("Error al registrar el Service Worker", err)
			);
	});
}
