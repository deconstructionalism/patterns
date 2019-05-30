/*
We have a nested object and we want to
- uppercase every key
- add an exclamation mark to every value
*/

const ourObject = {
  firstName: 'Arjun',
  lastName: 'Ray',
  address: {
    city: 'Providence',
    state: 'Rhode Island',
    street: 'Manton Avenue'
  },
  preferences: {
    color: {
      leastFavorite: 'orange',
      mostFavorite: 'black'
    }
  }
}


// const resultingObject = {
//   FIRSTNAME: 'Arjun!',
//   LASTNAME: 'Ray!',
//   ADDRESS: {
//     CITY: 'Providence!',
//     STATE: 'Rhode Island!',
//     STREET: 'Manton Avenue!'
//   },
//   PREFERENCES: {
//     COLOR: {
//       LEASTFAVORITE: 'orange!',
//       MOSTFAVORITE: 'black!'
//     }
//   }
// }

const makeObjectExciting = object => {

  const recurseObject = (subObject) => {
    const keys = Object.keys(subObject)
    // ['firstName', 'lastName', 'address', 'preferences']
    keys.forEach(key => {
  
      const value = subObject[key]

      if (typeof value === 'string') {
        // if that key's value is just a string, we just add
        // an exclamation mark to it
        console.log(`${key} is a string!`)
        subObject[key] += '!'
      } else {
        // if that key's value is another object, we need
        // to recurse 
        console.log(`${key} is not a string!`)
        recurseObject(value)
      }
  
      return subObject
  
    })
  }

   recurseObject(object)
   return object
}

const returnedObject = makeObjectExciting(ourObject)
console.log(returnedObject)