function whosPaying(names) {
    chosenName = Math.floor(Math.random()*names.length);
    return names[chosenName] + " is going to buy lunch today!"
 
     }
 
 names = ["Angela", "Ben", "Jenny", "Michael", "Chloe"];
 whosPaying(names)