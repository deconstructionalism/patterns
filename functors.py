# import functools


# def flow(funcs):
#     def reducer(v, func):
#         return func(v)
#     return functools.partial(functools.reduce, reducer, funcs)


# def addThree(x): return x + 3


# def multFour(x): return x * 4

# multThreeAddFour = flow([addThree, multFour])

# print(multThreeAddFour(6))


class KeyValueFunctor:

    def __init__(self, valDict):
        assert(isinstance(valDict, dict), 'no')
        self._values = valDict

    def map(self, func):
        dict_tuples = map(func, self._values.items())
        self._values = dict(dict_tuples)


mine = KeyValueFunctor({
    "me": 'Arjun',
    "occupation": 'bored'
})

def upcase_and_dbl(tup):
    key, val = tup
    return (key.upper(), val+val)

mine.map(upcase_and_dbl)
print(mine._values)

# mine = KeyValueFunctor(36)