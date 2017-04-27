/**
 * A naiive bayes classifier
 *
 * Note: I am actually taking the log transformation of counts rather than actual
 * probabilities. This makes the math easier and handles better for very
 * small values while still getting the same output
 */
export class NBClassifier {
    constructor(features, classes) {
        this.features = features;
        this.classes = classes;
        this.classCounts = {};
        this.featCounts = {};
        this.k = 1; // adjusts for zero
        for (let c of classes) {
            this.featCounts[c] = {};
            this.classCounts[c] = 0;
            for (let f of features) {
                this.featCounts[c][f] = {};
            }
        }
    }

    /**
     * Trains the classifer on data point `data`
     * @param data data point to train
     */
    train(data) {
        this.classCounts[data.class] = ++this.classCounts[data.class] || 1;
        var features = data.features;
        var c = data.class;
        for (let f of this.features) {
            if (features[f] in this.featCounts[c][f]) {
                this.featCounts[c][f][features[f]]++;
            } else {
                this.featCounts[c][f][features[f]] = 1;
            }
        }
    }

    /**
     * Classifies data point `data` as one of this classifier's provided
     * classes
     * @param data Data point to classify
     * @returns {string} A class label
     */
    classify(data) {
        var classProbs = {}; // Probability of data being a certain class
        for (let c of this.classes) {
            var features = data.features;
            var attProbs = this.features.map((f) => {
                return this.getAttProb(f, features[f], c)
            });
            var totalProb = attProbs.length > 0 ? 1 : 0;
            for (let p of attProbs) {
                totalProb += p;
            }
            classProbs[c] = totalProb + this.getPrior(c);
        }

        var cname = "";
        var best = Number.NEGATIVE_INFINITY;
        var totalPossible = 0;
        for (var c in classProbs) {
            totalPossible += Math.abs(classProbs[c]);
            if (classProbs[c] > best) {
                cname = c;
                best = classProbs[c];
            }
        }
        return {
            class: cname,
            certainty: Math.abs(classProbs[cname]) / totalPossible,
            anomaly: cname !== data.class
        };
    }

    /**
     * P(class)
     */
    getPrior(className) {
        var total = this.getDataCount();
        var cTotal = this.classCounts[className];
        return Math.log((cTotal + this.k) / (total + (this.k * this.classes.length)));
    }

    /**
     * P(att|class)
     */
    getAttProb(att, val, className) {
        var count = this.featCounts[className][att][val];
        if (!count) count = 0;
        var total = this.classCounts[className] + (this.k * this.classes.length) 
        var prob = Math.log((count + this.k) / total);
        return prob;
    }

    getDataCount() {
        var count = 0;
        for (let c of this.classes) {
            count += this.classCounts[c];
        }
        return count;
    }
}
