LTools = (function () {


  return {
    
    test: function () {
      alert("THIS IS A TEST");
      console.log("This test");
    },
    
    replaceAll: function (find, replace, str) {
      return str.replace(new RegExp(find, 'g'), replace);
    },

    // returns random multiple choice array of length n
    // from given array of objects including correct object
    // array.length must be greater than or equal to n + 1
    // TODO figure out how to make classes and methods to
    // rid myself of having to use .word
    getChoices: function (array, n, correct) {
      
      // if array.length < n, throw an exception
      
      var max = array.length, tmp, rand, i;
      
      // select n random items from array, put them at the back
      for (i = 0; i < (n + 1); i++) {
        rand = Math.floor(Math.random() * max);
        
        max--;
        
        tmp = array[max];
        array[max] = array[rand];
        array[rand] = tmp;
      }
      
      //alert("array " + array[0].word + array[1].word + array[2].word);
      
      // construct and return array of length n with randomly
      // inserted correct object
      var choices = [];
      var correctPosition = Math.floor(Math.random() * n);
    
      for (i = 0; choices.length < n; i++) {
    
        // choice equals each of the last random items
        var choice = array[array.length - (i + 1)];
        if (i === correctPosition) {
          // randomly insert corret object
          choices.push({ choice: correct, value: "Correct" });
          
        } else if (choice.word !== correct) {
          // insert random incorrect object
          choices.push({ choice: choice.word, value: "Incorrect" });
          
        } // else skip in case correct object was one of the randoms
      }
      
      //alert("choices " + choices[0].choice + choices[1].choice);
      
      return choices;
      
    } // getChoices
    
  }; // return
          
})();