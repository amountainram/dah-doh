type Callback<A> = (args: A) => void;

const promisify = <T, A>(fn: (args: T, cb: Callback<A>) => void): ((args: T) => Promise<A>) =>
  (args: T) => new Promise((resolve) => {
    fn(args, (callbackArgs) => {
      resolve(callbackArgs)
    })
  })

export {promisify}
