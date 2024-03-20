# CodeBuddy Extension 

## What is CodeBuddy? 
CodeBuddy is a VS Code extension which has the goal of creating a more enjoyable coding environment by creating a character which moves around the screen. It is there to make coders feel more connected and less isolated during long coding sessions. This friendly companion is not just about making the screen more fun; it is about making programmers feel better and more relaxed while they work. By only moving after a length of time which is adjustable in the settings, it ensures that programmers are not distracted but are able to take necessary breaks. This approach is all about balancing focus with wellbeing, making coding a more human and caring experience.

## Installation 
1) ```git clone``` this repository locally to your desired pathway.

2) Do the next commands below in the VSCode terminal. 
``` bash
npm install 
npm i -D @types/glob
npm audit fix
```
3) After that click ```Run``` on the top-left menu bar or ```F5``` to run the extention. 

## Future Implementations for CodeBuddy
CodeBuddy can also give coding tips to users. For example, it can suggest that they double-check that they spell variable and function names correctly, or did not miss a curly brace or semicolon. These tips will come from a premade list, and if the user spends a long time not doing work, CodeBuddy will say a randomly chosen tip from the list. “Double spellings in your variable names!” or “Descriptive names for your variables are a game changer!” are some examples of the type of tips that CodingBuddy will supply. The time and frequency of these tips can be configured by the user in the settings.
Users will be able to choose between one of two options for their avatar. In order to accommodate custom needs, users can adjust the extension in the settings page. They will be able to disable movement or adjust how often the character will move, as well as adjust how often the character gives tips or disable them. A special class will keep track of the user’s settings.
