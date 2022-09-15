let propositionDictionary = {
	propositions: [],
	switcher: 0,
	choiseSwitcher: 0,

	getData: async function (event) {
		this.propositions = [];
		console.log(this.propositions, "Getdata working");
		let selectedWord = getSelectedWord();
		if (selectedWord) {
			await fetch(`https://api.datamuse.com/sug?s=${selectedWord}`)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log(data, this.propositions, "getting data");

					for (let element of data) {
						this.propositions.push(element.word);
					}
					this.createPopup();

					this.setPopupPosition(event);
					return console.log("choise success");
				});

			return console.log("getData:success");
		} else {
			return this.removePopup();
		}
	},

	createPopup: function () {
		this.removePopup();
		let body = document.querySelector("body");
		console.log(this.propositions, "start of creation popup");

		const popupContainer = document.createElement("div");
		popupContainer.className = "popupContainer";
		popupContainer.setAttribute("id", "wordPopup");

		body.appendChild(popupContainer);

		let popup = document.createElement("div");
		popup.className = "popup";
		popupContainer.appendChild(popup);
		let buttons = [];
		let buttonTexts = [];
		for (let i = 0; i < 5 && i < this.propositions.length - 1; i++) {
			buttons[i] = document.createElement("button");
			buttons[i].className = "buttonWords";
			console.log("Цикл працює");
			buttons[i].addEventListener("mousedown", () => {
				this.removePopup(this.chooseWord(this.propositions[i]));
			});

			popup.appendChild(buttons[i]);
			buttonTexts[i] = document.createTextNode(`${this.propositions[i]}`);
			buttons[i].appendChild(buttonTexts[i]);
		}

		return console.log(this.propositions, "createPopup works!");
	},
	setPopupPosition: function (event) {
		const popupPosition = activeTextElement.getBoundingClientRect();
		const popup = document.getElementById("wordPopup");
		popup.style.top = `${popupPosition.top + popupPosition.height}px`;
		popup.style.left = `${
			popupPosition.left + event.target.selectionStart * 2
		}px`;
		return popupPosition;
	},

	removePopup: function () {
		let usedPopup = document.getElementById("wordPopup");
		if (usedPopup) {
			this.choiseSwitcher = 0;
			console.log("removed popup");
			return usedPopup.remove(usedPopup);
		}
	},

	chooseWord: function (chosen) {
		console.log("Word replaced");
		this.choiseSwitcher = 1;
		return activeTextElement.setRangeText(
			chosen,
			+this.selectedWordData.start,
			+this.selectedWordData.end,
			"end"
		);
	},
};
propositionDictionary.selectedWordData = {};

function getSelectedWord() {
	if (activeTextElement && activeTextElement.selectionStart >= 0) {
		const boundaries = {
			start: activeTextElement.selectionStart - +propositionDictionary.switcher,
			end: activeTextElement.selectionStart - +propositionDictionary.switcher,
		};
		const range = document.createRange();
		range.selectNode(activeTextElement);

		let text =
			range.cloneContents().textContent ||
			document.getElementsByTagName("input")[0].value;

		if (text) {
			let i = 0;
			while (i < 1) {
				const start = boundaries.start;
				const end = boundaries.end;
				const prevChar = text.charAt(start - 1);
				const currentChar = text.charAt(end);

				if (!prevChar.match(/\s/g) && prevChar.length > 0) {
					boundaries.start--;
				}

				if (!currentChar.match(/\s/g) && currentChar.length > 0) {
					boundaries.end++;
				}

				if (start === boundaries.start && end === boundaries.end) {
					console.log("found!");
					i = 1;
				}
			}
			propositionDictionary.selectedWordData = {
				start: boundaries.start,
				end: boundaries.end,
			};
			console.log(propositionDictionary.selectedWordData);
			return text.slice(boundaries.start, boundaries.end);
		}
	}
}
let activeTextElement;
let inputs = Array.from(document.querySelectorAll("input"));
let contentEditableElements = Array.from(
	document.querySelectorAll('[contenteditable="true"]')
);
let textareas = Array.from(document.querySelectorAll("textarea"));
let changableElements = inputs.concat(contentEditableElements, textareas);

for (let element of changableElements) {
	element.addEventListener("mouseup", (event) => {
		activeTextElement = element;
		propositionDictionary.switcher = 0;
		propositionDictionary.getData(event);
		console.log("click");
	});

	element.addEventListener("keyup", function (event) {
		if (event.code == "Space") {
			activeTextElement = element;
			propositionDictionary.switcher = 1;
			propositionDictionary.getData(event);
			console.log("space");
		}
	});
}
