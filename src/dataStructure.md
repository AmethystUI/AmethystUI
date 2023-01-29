
# Data structures n' stuff
This is just a markdown that keeps track of all the data structure used to build Amethyst. Use it however you like: as a reference or as toilet paper.

## Element trees
Data structure represented in TS:

```ts
type HTMLtag = "DIV" | "SECTION" | "BUTTON" | ...;
type units = "px" | "pt" | "em" | ...;
// ...

interface collection{
	name : string,
	elements : element[]
}

interface element{
	type : HTMLtag,
	style : elementStyle
	styleOverrides : override[]
}

interface elementStyle{
	backgroundColor : string,
	border : number[],
	borderUnit : units,
	// ...
}

interface override{
	name : string,
	style : elementStyle
}
```

**Explanation:**
Every collection contains a list of HTML base elements (`<div>` or `<button>`). These styles will be the default appeance for the elements. For every element we also have `styleOverrides`, which is a group of named styles that can override the base element style to provide a more expansive design. For edample, a button may have an override named `primary` and `secondary`, each with its own attributes that overrides the default styles of the button. These overrides will be used in the form of classes in code, and will be packaged as classes in our CSS bundle.