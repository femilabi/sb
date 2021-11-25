const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    let anagram_results = [];
    let words = ["ate", "map", "eat", "pat", "tea", "tap"];
    // let words = req.body.words;
    let anagram_set = words
        .map((w) => w.split('').sort().join(''))
        .filter((v, i, a) => a.indexOf(v) === i);

    for (let i = 0; i < anagram_set.length; i++) {
        let group = [];
        for (let j = 0; j < words.length; j++) {
            if (anagram_set[i] == words[j].split('').sort().join('')) {
                group.push(words[j]);
                words.splice(j, 1);
            }
        }
        anagram_results.push(group);
    }

    req.App
        .assignData("results", anagram_results)
        .setMsg("You anagrams resolved successfully", "success")
        .send();
});

module.exports = router;
