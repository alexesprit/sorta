import rewire from "rewire"
const sortTracks = rewire("@/util/sortTracks")
const compareStrings = sortTracks.__get__("compareStrings")
// @ponicode
describe("sortTracks.sortTracks", () => {
    test("0", () => {
        let callFunction: any = () => {
            sortTracks.sortTracks([], [])
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("compareStrings", () => {
    test("0", () => {
        let callFunction: any = () => {
            compareStrings("Foo bar", "Hello, world!")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            compareStrings("This is a Text", "Hello, world!")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            compareStrings("foo bar", "This is a Text")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            compareStrings("Foo bar", "Foo bar")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            compareStrings("foo bar", "Hello, world!")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            compareStrings("", "")
        }
    
        expect(callFunction).not.toThrow()
    })
})
