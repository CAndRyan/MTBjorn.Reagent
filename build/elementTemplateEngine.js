// JSX templating adapted from: https://betterprogramming.pub/how-to-use-jsx-without-react-21d23346e5dc
// Instead of using pragma statements at the top of each file, specify in babel config

const classAttributePropName = 'className';

const getAttributeName = (propName) => {
	switch (propName) {
		case classAttributePropName:
			return 'class';
		default:
			return propName;
	}
};

const getElementWithAttributesAndEventHandlers = (tag, props) => {
	const element = document.createElement(tag);

	Object.entries(props || {}).forEach(([name, value]) => {
		try {
			const attributeName = getAttributeName(name);

			if (attributeName.startsWith("on") && attributeName.toLowerCase() in window)
				element.addEventListener(attributeName.toLowerCase().substr(2), value);
			else if (value) // Ignore falsey values, the intended equivalence to no attribute (e.g. disabled="false" is still disabled in the DOM)
				element.setAttribute(attributeName, value.toString());
		}
		catch (error) {
			console.error(`Unable to add attribute '${attributeName}' with value '${value}'`);
		}
	});

	return element;
};

const appendChild = (parent, child) => {
	if (Array.isArray(child))
		child.forEach(nestedChild => appendChild(parent, nestedChild));
	else
		parent.appendChild(child.nodeType ? child : document.createTextNode(child));
};

const createElement = (tag, props, ...children) => {
	if (!props)
		props = {};

	if (typeof tag === "function")
		return tag(props, ...children);

	const element = getElementWithAttributesAndEventHandlers(tag, props);

	children.forEach(child => {
		appendChild(element, child);
	});

	return element;
};

// To accomodate the JSX empty tag syntax '<>'
const createFragment = (props, ...children) => children;

export default {
	createElement,
	createFragment
};
