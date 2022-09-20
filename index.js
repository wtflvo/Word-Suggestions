let propositionDictionary = {
	propositions: [],
	switcher: 0,
	selectedWord: null,
	selectedWordData: {},
	text: null,

	getData: async function (event) {
		this.propositions = [];
		console.log(this.propositions, "Getdata working");
		this.selectedWord = getSelectedWord();
		if (this.selectedWord) {
			await fetch(`https://api.datamuse.com/sug?s=${this.selectedWord}`)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					for (let element of data) {
						this.propositions.push(element.word);
					}
					this.createPopup();

					this.setPopupPosition(event);
					return console.log("choise success");
				});
		} else {
			return this.removePopup();
		}

		this.setPopupPosition(event, this.createPopup());
	},

	createPopup: function () {
		this.removePopup();
		let body = document.querySelector("body");
		const popupContainer = document.createElement("div");
		popupContainer.className = "popupContainer";
		popupContainer.setAttribute("id", "wordPopup");
		body.appendChild(popupContainer);
		let popup = document.createElement("div");
		popup.className = "popup";
		popupContainer.appendChild(popup);
		let buttons = [];
		let buttonTexts = [];
		for (let i = 0; i < 5 && i < this.propositions.length; i++) {
			buttons[i] = document.createElement("button");
			buttons[i].className = "buttonWords";
			buttons[i].addEventListener("mousedown", () => {
				this.removePopup(this.chooseWord(this.propositions[i]));
			});

			popup.appendChild(buttons[i]);
			buttonTexts[i] = document.createTextNode(`${this.propositions[i]}`);
			buttons[i].appendChild(buttonTexts[i]);
		}
		let popupColorContainer = document.createElement("div");
		let popupColorTextContainer = document.createElement("h5");
		popupColorTextContainer.style.margin = "4px auto 2px auto";
		const popupColorText = document.createTextNode("Choose background color");
		popupColorTextContainer.appendChild(popupColorText);
		popupColorContainer.appendChild(popupColorTextContainer);
		let popupColorInput = document.createElement("input");
		popupColorInput.setAttribute("type", "color");
		if (sessionStorage.getItem("popupColor")) {
			popupContainer.style.backgroundColor =
				sessionStorage.getItem("popupColor");
			popupColorInput.value = sessionStorage.getItem("popupColor");
		} else {
			popupContainer.style.backgroundColor = "#262525";
			popupColorInput.value = "#262525";
		}
		popupColorInput.addEventListener("input", (event) => {
			sessionStorage.setItem("popupColor", event.target.value);
			popupColorInput.value = event.target.value;
			popupContainer.style.backgroundColor = `${event.target.value}`;
		});
		popupColorContainer.appendChild(popupColorInput);
		return popup.appendChild(popupColorContainer);
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
			return usedPopup.remove(usedPopup);
		}
	},

	chooseWord: function (chosen) {
		if (
			activeTextElement.tagName == "INPUT" ||
			activeTextElement.tagName == "TEXTAREA"
		) {
			return activeTextElement.setRangeText(
				chosen,
				+this.selectedWordData.start,
				+this.selectedWordData.end,
				"end"
			);
		} else {
			let range;

			if (window.getSelection) {
				sel = window.getSelection();
				if (selection.rangeCount > 0) {
					range = selection.getRangeAt(0).cloneRange();
					range.collapse(true);
					range.setStart(activeTextElement, 0);
				}
			}

			let words = range.toString().trim().split(" "),
				lastWord = words[words.length - 1];

			if (lastWord) {
				range.setStart(range.endContainer, this.selectedWordData.start);
				range.setEnd(range.endContainer, this.selectedWordData.end);
				range.deleteContents();
				range.insertNode(document.createTextNode(chosen));
				activeTextElement.normalize();
			}
			return lastWord;
		}
	},
};

function getSelectedWord() {
	if (activeTextElement) {
		let boundaries = {};
		if (activeTextElement && activeTextElement.selectionStart >= 0) {
			boundaries.start =
				+activeTextElement.selectionStart - +propositionDictionary.switcher;
			boundaries.end =
				+activeTextElement.selectionStart - +propositionDictionary.switcher;

			if ((activeTextElement.tagName = "INPUT")) {
				propositionDictionary.text = activeTextElement.value;
			} else if ((activeTextElement.tagName = "TEXTAREA")) {
				propositionDictionary.text = activeTextElement.textContent;
			}
		} else {
			let caretPos = 0;
			let range;
			if (window.getSelection) {
				if (selection.rangeCount) {
					range = selection.getRangeAt(0);
					if (range.commonAncestorContainer.parentNode == activeTextElement) {
						caretPos = range.endOffset;
					}
					boundaries.start = caretPos - +propositionDictionary.switcher;
					boundaries.end = caretPos - +propositionDictionary.switcher;
					propositionDictionary.text = activeTextElement.textContent;
				}
			}
		}

		if (propositionDictionary.text) {
			let i = 0;
			while (i < 1) {
				const start = boundaries.start;
				const end = boundaries.end;
				const prevChar = propositionDictionary.text.charAt(start - 1);
				const currentChar = propositionDictionary.text.charAt(end);

				if (!prevChar.match(/\s/g) && prevChar.length > 0) {
					boundaries.start--;
				}

				if (!currentChar.match(/\s/g) && currentChar.length > 0) {
					boundaries.end++;
				}

				if (start === boundaries.start && end === boundaries.end) {
					i = 1;
				}
			}
			propositionDictionary.selectedWordData = {
				start: boundaries.start,
				end: boundaries.end,
			};

			return propositionDictionary.text.slice(boundaries.start, boundaries.end);
		}
	}
}

let selection = document.getSelection();
let { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
let activeTextElement;
let inputs = Array.from(document.querySelectorAll('input[type="text"]'));
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
	});

	element.addEventListener("keyup", function (event) {
		if (event.code == "Space") {
			activeTextElement = element;
			propositionDictionary.switcher = 1;
			propositionDictionary.getData(event);
		}
	});
}
