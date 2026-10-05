// Goal:
// Combine call and construct signatures

// Expected result:
// The compiler accepts both call and new usage

export {};

type DateLikeFactory = {
    (timeStampValue?:number):string;
    new (timeStampValue?:number):Date;
};

function useDateLikeFactroy(factory:DateLikeFactory):void {
    console.log(factory(0));
    console.log(new factory(0).toISOString());
}

useDateLikeFactroy(Date);