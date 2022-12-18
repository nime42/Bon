class Flexy {

	constructor(mainDiv, direction) {
		if (typeof mainDiv === "string") {
			this.myDiv = document.querySelector(mainDiv);
		} else {
			this.myDiv = mainDiv;
		}
		this.myDiv.style.display = "flex";
		this.myDiv.style.flexDirection = direction;
		this.myElement = new FlexyElement(this.myDiv);
	}


	static Button(text) {
		let b = document.createElement("button");
		b.innerHTML = text;
		return new FlexyElement(b);
	}
	static Label(text) {
		let l = document.createElement("label");
		l.innerHTML = text;
		return new FlexyElement(l);
	}

	static Input(type,value,name) {
		let i = document.createElement("input");
		i.setAttribute("type", type);
		name && i.setAttribute("name",name);
		value && (i.value=value);
		return new FlexyElement(i);
	}

	static Select(name) {
		let s=document.createElement("select");
		s.setAttribute("name",name);
		return new FlexyElement(s);
	}
	static Option(value,text) {
		let o = document.createElement("option");
		o.innerHTML = text;
		o.value=value
		return new FlexyElement(o);
	}



	static Frame(direction,overflow) {
		let d = document.createElement("div");
		d.style.display = "flex";
		d.style.alignItems = "center";
		d.style.flexDirection = direction;
		d.style.overflow=overflow;


		return new FlexyElement(d);

	}

	add(element, align) {
		this.myElement.add(element, align);
		return this;
	}

	static search(cssSelector,flexyElement) {
		let res=[];
		let start=document;
		if(flexyElement) {
			start=flexyElement.htmlElement;
		}
		document.querySelectorAll(cssSelector).forEach(e=>{
			let flexyElement=e.getAttribute(FlexyElement._FLEXY_ELEM_ATTRIBUTE);
			if(flexyElement!==undefined) {
				res.push(FlexyElement.html2FlexyElem[flexyElement]);
			}
		})
		return res;
	}


}



class FlexyElement {

	static _FLEXY_ELEM_ATTRIBUTE="data-flexy-element";
	static html2FlexyElem=[];
	static currentIndex=0;


	constructor(element) {
		if (typeof element === "string") {
			this.htmlElement = document.createElement(element);
		} else {
			this.htmlElement = element;
		}
		this.htmlElement.setAttribute(FlexyElement._FLEXY_ELEM_ATTRIBUTE,FlexyElement.currentIndex)
		FlexyElement.html2FlexyElem[FlexyElement.currentIndex++]=this;
	}

	removeMe() {
		this.htmlElement.remove();
		let i=this.htmlElement.getAttribute(FlexyElement._FLEXY_ELEM_ATTRIBUTE);
		delete this.html2FlexyElem[i];


		//this.htmlElement.parentElement.removeChild(this.htmlElement)
	}

	class(...args) {
		let self = this;
		args.forEach(arg => {
			self.htmlElement.classList.add(arg);
		})
		return this;
	}
	style(style) {
		Object.assign(this.htmlElement.style, style);
		return this;
	}
	id(id) {
		this.htmlElement.id = id;
		return this;
	}
	add(element, align) {
		this.htmlElement.appendChild(element.htmlElement);
		let child = element.htmlElement;
		switch (align) {
			case "start":
				child.style.alignSelf = "start";
				break;
			case "end":
				child.style.alignSelf = "end";
				break;
			case "stretch":
				child.style.alignSelf = "stretch";
				if(this.htmlElement.style.flexDirection==="column") {
					if(child.style.height==='') {
						child.style.height="100%";
					}
				} else if(this.htmlElement.style.flexDirection==="row") {
					if(child.style.width==='') {
						child.style.width="100%";
					}
				}
				break;

		}

		return this;
	}

	onClick(fun) {
		this.htmlElement.onclick=fun;
		return this;
	}

	click() {
		this.htmlElement.onclick();

	}

	variable(v,localVars) {

		FlexyVariable.variable(this.htmlElement,v,localVars);
		return this;
	}


	value(expr,localVars) {
		FlexyVariable.valueExpr(this.htmlElement,expr,localVars);
		return this;
	}

	visible(onOff) {

		if(onOff===true) {
			this.htmlElement.style.display="flex";
		} else if(onOff===false) {
			this.htmlElement.style.display="none";
		}
		return this.htmlElement.style.display==="flex";

	}

	getChildren() {
		let res=[];
		[...this.htmlElement.children].forEach(e=>{
			let flexyElement=e.getAttribute(FlexyElement._FLEXY_ELEM_ATTRIBUTE);
			if(flexyElement!==undefined) {
				res.push(FlexyElement.html2FlexyElem[flexyElement]);
			}			
		});
		return res;
	}


}

class FlexyVariable {
	static _VALUE_EXPR_ATTRIBUTE="data-value-expression";
	static variables = {};

	static variable(htmlElement,v,localVars) {
		let variables=FlexyVariable.variables;
		if(localVars) {
			variables=localVars;
		}
		if (variables[v] === undefined) {
			variables[v] = {
				obj: htmlElement,
				affecteds: []
			}
		} else {
			variables[v].obj = htmlElement;
		}


		if (htmlElement.oninput !== undefined) {
			htmlElement.addEventListener("input", (evt) => {
				let toRemove=[];
				variables[v].affecteds.forEach((e,i) => {
					if(e.isConnected) {
						let newValue = FlexyVariable.evalExpr(e.getAttribute(FlexyVariable._VALUE_EXPR_ATTRIBUTE),variables);
						if(newValue!=null) {
							FlexyVariable.updateElem(e, newValue);
						}
					} else {
						toRemove.push(i);
					}
				})
				toRemove.reverse().forEach(i=>{
					variables[v].affecteds.splice(i,1);
				})

			});
		}

	}

	static valueExpr(htmlElement,expr,localVars) {
		let variables=FlexyVariable.variables;
		if(localVars) {
			variables=localVars;
		}
		if(expr===undefined) {
			return htmlElement.getAttribute(FlexyVariable._VALUE_EXPR_ATTRIBUTE)
		}

		if(expr===null) {
			let currentExpr=htmlElement.getAttribute(FlexyVariable._VALUE_EXPR_ATTRIBUTE);
			if(currentExpr) {
				let currentVars = [...currentExpr.matchAll(/\$\{([^\}]*)\}/g)].map(e => (e[1]));
				currentVars.forEach(v=>{
					variables[v].affecteds=variables[v].filter(e=>(e!==htmlElement));

				})

				htmlElement.setAttribute(FlexyVariable._VALUE_EXPR_ATTRIBUTE, undefined);
			}
			return;
		}

		let allVars = [...expr.matchAll(/\$\{([^\}]*)\}/g)].map(e => (e[1]));
		allVars=[...new Set(allVars)]; //remove duplicates (e.g "${v} + ${v}")
		allVars.forEach(v => {
			if (variables[v] !== undefined) {
				variables[v].affecteds.push(htmlElement);
			} else {
				variables[expr] = {
					obj: undefined,
					affecteds: [htmlElement]
				}
			}
		})
		htmlElement.setAttribute(FlexyVariable._VALUE_EXPR_ATTRIBUTE, expr);

		let value=FlexyVariable.evalExpr(expr,variables);
		if(value!==null) {
			FlexyVariable.updateElem(htmlElement,value);
		}

	}


	static setValue(variable,value,localVars) {
		let variables=FlexyVariable.variables;
		if(localVars) {
			variables=localVars;
		}
		let elem=variables.variables[variable]?.obj;
		if(elem!==undefined) {

			switch(elem.type) {
				case "checkbox":
					elem.checked=value;
					break;
				case "radio":
					let name=elem.name;

					document.querySelectorAll(`input[type=radio][name='${name}']`).forEach(e=>{
						if(e.value===value) {
							e.checked=true;
						} else {
							e.checked=false;
						}
					})
					break;
				default:
					elem.value=value;
			}		

			elem.dispatchEvent(new Event('input', {bubbles:true}));
		}
	}

	static getValue(v,localVars) {
		let variables=FlexyVariable.variables;
		if(localVars) {
			variables=localVars;
		}

		let value;
		let elem=variables[v]?.obj;
		if(elem!==undefined) {
			switch(elem.type) {
				case "checkbox":
					if(elem.checked) {
						value=elem.value;
					} else {
						value=undefined;
					}
					break;
				case "radio":
					let name=elem.name;
					let checked=document.querySelector(`input[type=radio][name='${name}']:checked`);
					if(checked!=undefined) {
						value=checked.value;
					}
					break;
				default:
					value=elem.value;
			}		
		}
		return value

	}

	static searchVariables(pattern,localVars) {
		let variables=FlexyVariable.variables;
		if(localVars) {
			variables=localVars;
		}

		let res=[];
		Object.keys(variables).forEach(v=>{
			if(v.match(pattern)) {
				res.push(v);
			}
		})
		return res;
	}

	static createLocalVars() {
		return {};
	}

	static updateElem(el, val) {
		if (el.value !== undefined) {
			el.value = val;
		} else {
			el.innerText = val;
		}
	}



	static evalExpr(expr,localVars) {


		let vars = expr.match(/\$\{[^\}]*\}/g);
		if(vars===null) {
			vars=[];
		}
		vars=vars.map((e) => {
			return /\$\{ *([^ \}]*) *\}/.exec(e)[1];
		});

		let value = expr;
		vars.forEach((v) => {
			let re = new RegExp("\\$\\{ *" + v + " *\\}");
			let newVal = FlexyVariable.getValue(v);

			value = value.replace(re, newVal);
		});

		let failed=false;
		let subExprs=[...value.matchAll(/(?:^|[^\\])\{(.*?)\}/g)].map(e=>(e[1]));
		subExprs.forEach(e=>{
			try {
			let v=eval(e);
			value = value.replace("{"+e+"}", v);
			} catch (err) { 
				console.log(e,err);
				failed=true;
			}

		})

		if(failed) {
			return null;
		} else {
			return value;
		}
		
	}


}
