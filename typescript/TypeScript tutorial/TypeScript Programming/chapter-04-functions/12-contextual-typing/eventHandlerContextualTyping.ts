// Goal:
// Observe contextual typing with a simplifield event handler

// Expected result:
// The compiler infers the event parameter from handler type

export { };

type ClickEvent = {
    x: number;
    y: number;
};

type ClickHandler = (event: ClickEvent) => void;

function registerClickHandler(handler:ClickHandler):void {
    handler ({x:10,y:20});
}

registerClickHandler((event)=>{
    console.log(event.x+event.y);

    //@ts-expect-error: ClickEvent has no key property.
    console.log(event.key);
});

