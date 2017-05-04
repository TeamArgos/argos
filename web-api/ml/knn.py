import json
from pprint import pprint
from sklearn.neighbors import KNeighborsClassifier as KNN

classifier = KNN(n_neighbors=3)
samples = [[0, 0, 2], [1, 0, 0], [0, 0, 1]]
classes = [0, 1, 1]
test = [0, 0, 1.3]

classifier.fit(samples, classes)
n = classifier.predict([test])

with open("./data/sample.json") as f:
    data = json.load(f)
pprint(data)

for key, val in data:

