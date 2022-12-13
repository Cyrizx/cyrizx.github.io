cmdHistoryArr = [];
var i = 0;

var keys = {
  65: "a",
  66: "b",
  67: "c",
  68: "d",
  69: "e",
  70: "f",
  71: "g",
  72: "h",
  73: "i",
  74: "j",
  75: "k",
  76: "l",
  77: "m",
  78: "n",
  79: "o",
  80: "p",
  81: "q",
  82: "r",
  83: "s",
  84: "t",
  85: "u",
  86: "v",
  87: "w",
  88: "x",
  89: "y",
  90: "z",
  32: " ",
  38: "",
  40: "",
  13: "<br>"
};



var menu = {
  cmds: ["datetime                Time", "about", "projects", "escape", "you", "adventure"],
  cmdDetector: function(cmd) {
    switch(cmd) {
      case "datetime":
        menu.getDate();
        break;
      case "about":
        menu.about();
        break;
      case "projects":
        menu.projects();
        break;
      case "escape":
        menu.escape()
        break;
      case "you":
        menu.you();
        break;
      case "adventure":
        menu.adventure();
        break;
      case "help":
        menu.showMenu();
        break;
      case "a":
        menu.showMenu2();
        break;
      default: 
       menu.printStr(menu.defaultErr());
       break;
    }
  },
  showMenu: function() {
    $("#menu").html("");
    $.each(menu.cmds, function(i, v) {
      $("#menu").append(v + "<br>");
    })
  },
  showMenu2: function() {
    $("#menu").html("");
    $("#menu").append('/ About me' + "<br>");
    $("#menu").append('' + "<br>");
    $("#menu").append("Highly effective, responsible, optimistic, with the vision to achieve more of the "+ "<br>");
    $("#menu").append("to achieve more than the objectives set, I am satisfied to make my work known not as sufficient my work not as sufficient but as excellent, I am dynamic, organized, enterprising." + "<br>");

  },
  defaultErr: function() {
    var errMsg = "That command does not exist. Enter 'help' for a list of commands.";
    return errMsg;
  },
  getDate: function() {
     var dateTime = new Date().toLocaleString();
    menu.printStr(dateTime);
  },
  about: function() {
    $("#menu").html("");
    $("#menu").append('# About me' + "<br>");
    $("#menu").append('' + "<br>");
    $("#menu").append("Highly effective, responsible, optimistic, with the vision to achieve more of the "+ "<br>");
    $("#menu").append("to achieve more than the objectives set, I am satisfied to make my work known not as sufficient my work not as sufficient but as excellent, I am dynamic, organized, enterprising." + "<br>");
  },
  projects: function() {
    var projectTxt = "Projects";
    menu.printStr(projectTxt);
  },
  escape: function() {
    var escapeTxt = "Get me outta here!";
    menu.printStr(escapeTxt);
  },
  adventure: function() {
    var msg = "Coming soon...";
    menu.printStr(msg);
  },
  you: function() {
    var msg = "Get to know you";
    menu.printStr(msg);
  },
  printStr: function(str) {
    var output = "<span> " +str+ " </span>";
    $("#menu").html(output);
  }
}
var prompt = {
  keyDetector: function(e) {
    var input = e.which;
   // alert(input);
    $.each(keys, function(key, value) {
      if (input == key) {
        switch (input) {
          case 32:
            $('#cmds').append(value);
          break;
          case 13:
            i=0;
            prompt.cmdHistory(); //to save cmd
            menu.cmdDetector(prompt.currentInput().trim());
            prompt.newLine();
          break;
          case 38:
            prompt.getLastCmd();
          break;
          case 40:
            prompt.getMoreRecentCmd();
          break;
          default:
            $('#cmds').append(value);
        }
        /*if (input == 32) {
          $('#cmds').append(value);
        } else if (input == 13) {
          prompt.cmdHistory();
          menu.cmdDetector(prompt.currentInput().trim());
          prompt.newLine();
        } else {
          $('#cmds').append(value);
        }*/
      }
      prompt.currentInput();
    })
  },
  currentInput: function() {
    var str = $("#cmds").text().substring(2);
    return str;
  },
  newLine: function() {
    $('#cmds').append().html("<br> $ ");
  },
  cmdHistory: function() {
    var previousCmd = prompt.currentInput().trim();
    cmdHistoryArr.unshift(previousCmd);
  },
  getLastCmd: function() {
    prompt.printCmd(cmdHistoryArr[i].trim());
    i++; 
  },
  getMoreRecentCmd: function() {
    if (i>0) {
    prompt.printCmd(cmdHistoryArr[i].trim())
    i--;
    }
  },
  printCmd: function(cmd) {
    $('#cmds').text('$ ' + cmd);
  },
  backspace: function() {
    var oldStr = prompt.currentInput();
    var newStr = oldStr.substring(0, oldStr.length - 1);
    $('#cmds').text('$ ' + newStr);
  }

}

prompt.newLine();

$(document).keydown(function(e) {
  if (e.keyCode == 8) {
    e.preventDefault();
    prompt.backspace();
  } else {
  prompt.keyDetector(e);
  }
});