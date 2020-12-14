const storage = (() => {
  let data = window.localStorage
  let key = 'data'

  const getItems = () => JSON.parse(data.getItem(key))

  const reset = () => data.clear()

  const setKey = (str) => {
    key = str
  }

  const update = (newInfo, condition) => {
    let storedData = getItems()
    let index

    storedData.forEach((item, i) => {
      if (condition(item)) index = i
    })

    storedData[index] = newInfo
    data.setItem(key, JSON.stringify(storedData))
  }

  const remove = (condition) => {
    let storedData = getItems()
    let index

    storedData.forEach((item, i) => {
      if (condition(item)) index = i
    })

    storedData.splice(index, 1)
    data.setItem(key, JSON.stringify(storedData))
  }

  const store = (info) => {
    let storedData = getItems()

    if (storedData) {
      storedData.push(info)
    }
      
    data.setItem(key, JSON.stringify(storedData || [info]))
  }

  return {
    data,
    setKey,
    getItems,
    reset,
    store,
    update,
    remove,
  }
})()

export { storage }