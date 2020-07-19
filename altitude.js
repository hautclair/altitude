/*
 * Altitude - ACT DPS Overlay
 * --------------------------
 *
 */

// Global variables
var currentEncounter = "None";

function initSimple() {
  for (var i = 0; i < 9; ++i) {
    document.getElementById("player-container-" + i).innerHTML = "<div class=\"player-simple\"> \
              <div class=\"player-encdps\" style=\"position: relative; z-index: " + ((i + 1) * 2) + "\"> \
                <div class=\"player-encdpstext-dps\" id=\"player-encdpstext-" + i + "\">00.00K</div> \
              </div> \
              <div class=\"player-info\"> \
                <div class=\"player-job\" id=\"player-job-" + i + "\"> \
                  <img src=\"img/job/ast.svg\" /> \
                </div> \
                <div class=\"player-name\" id=\"player-name-" + i + "\"> \
                  Player 1 \
                </div> \
                <div class=\"other\" id=\"other-" + i + "\"> \
                  Attack - 0 \
                </div> \
              </div> \
            </div> \
            <div class=\"player-dmgspacer\" style=\"position: relative; z-index: " + (((i + 1) * 2) + 1) + "\"> \
            </div> \
            <div class=\"player-dmgbar\" id=\"player-dmgbar-" + i + "\"> \
              <div class=\"fill-ast\"> \
              </div> \
            </div> \
          </div>";

    document.getElementById("player-container-" + i).style.display = "none";
  }
  document.addEventListener("onOverlayDataUpdate", function (e) {
    update(e.detail);
  });
}



function update(data) {
  updateEncounter(data);

  updateCombatants(data.Combatant);
  // (document.getElementById("combatantTableHeader") == null) {
  //  updateCombatantListHeader();
    //}
    // updateCombatantList(data);
}

function updateEncounter(data) {
  document.getElementById('encounter-time').innerText = data.Encounter.duration;
  document.getElementById('encmain').innerText = data.Encounter.title;
  if (currentEncounter != data.Encounter.CurrentZoneName) {
    currentEncounter = data.Encounter.CurrentZoneName;

    // Update the encounter image.
    if (_enc[currentEncounter] != null) {
      document.getElementById('encounter-icon').innerHTML = "<img src=\"img/enc/" + _enc[currentEncounter] + ".png\" />";
    } else {
      document.getElementById('encounter-icon').innerHTML = "<img src=\"img/enc/unknown.png\" />";
    }
  }
  document.getElementById('encloc').innerText = data.Encounter.CurrentZoneName;
  document.getElementById('rdnum').innerText = dpsformat(data.Encounter.encdps);
}

function updateCombatants(data) {
  var combatants = Object.keys(data);
  var i = 0;

  while (i < combatants.length) {
    var current = data[combatants[i]];
    var currentJob = current.Job.toLowerCase();
    var currentRole;
    switch (currentJob) {
      case "cnj":
      case "whm":
      case "sch":
      case "ast":
        currentRole = "hlr";
        break;
      case "mrd":
      case "war":
      case "gld":
      case "gla":
      case "pld":
      case "drk":
      case "gnb":
        currentRole = "tank";
        break;
      default:
        if (current.name == "Limit Break") {
          currentRole = "lb";
        } else {
          currentRole = "dps";
        }
    }

    // Set DPS value and adjust role colour as necessary
    document.getElementById("player-encdpstext-" + i).className = "player-encdpstext-" + currentRole;

    var encdps = dpsformat(current.encdps);

    if (encdps == "NaN") {
      document.getElementById("player-encdpstext-" + i).innerText = "0.0";
    } else {
      document.getElementById("player-encdpstext-" + i).innerText = encdps;
    }
    // Set Job icon
    if (current.name == "Limit Break") {
      document.getElementById("player-job-" + i).innerHTML = "<img src=\"img/job/lb.svg\" />";
    } else {
      document.getElementById("player-job-" + i).innerHTML = "<img src=\"img/job/" + currentJob + ".svg\" />";
    }

    // Set Player Name, including #deaths if existent
    if (parseInt(current.deaths) == 0) {
      document.getElementById("player-name-" + i).innerHTML = current.name;
    } else {
      document.getElementById("player-name-" + i).innerHTML = current.name + "  <span style=\"font-family: \'Anka/Coder Narrow\', monospace\">(<span style=\"margin-left: 2px; margin-right: 2px; color: #ff0000;\">-" + current.deaths + "</span>)</span>";
    }
    // Set Max Hit Info
    document.getElementById("other-" + i).innerText = current.maxhit;

    // Set DPS bar colour
    if (current.name == "Limit Break") {
      document.getElementById("player-dmgbar-" + i).innerHTML = "<div class=\"fill-lb\"></div>";
    } else {
      document.getElementById("player-dmgbar-" + i).innerHTML = "<div class=\"fill-" + currentJob + "\"></div>";
    }
    // Adjust DPS bar width based on highest DPS player
    var percentageDPS = parseInt(current.encdps / data[combatants[0]].encdps * 100);
    //console.log("Limit Break % - " + percentageDPS);
    document.getElementById("player-dmgbar-" + i).style.width = "calc((100% - 95px) * " + percentageDPS + " / 100)";
    // Show this row
    document.getElementById("player-container-" + i).style.display = "inline";
    i++;
    if (i == 9) {
      break;
    }
  }
  // Update column shadow
  document.getElementById("columnshadow").style.height = (64 + (i * 35)) + "px";

  // Hide remaining rows
  while (i < 9) {
    document.getElementById("player-container-" + i).style.display = "none";
    i++;
  }


}

function dpsformat(str) {
  var format = parseFloat(str);
  var result;
  if (format >= 10000) {
    var over_ten_k = format / 1000;
    result = over_ten_k.toFixed(2) + "K";
  } else {
    result = format.toFixed(1);
  }
  return result;
}



/* function parseActFormat(str, dictionary) {
    var result = "";

    var currentIndex = 0;
    do {
        var openBraceIndex = str.indexOf('{', currentIndex);
        if (openBraceIndex < 0) {
            result += str.slice(currentIndex);
            break;
        }
        else {
            result += str.slice(currentIndex, openBraceIndex);
            var closeBraceIndex = str.indexOf('}', openBraceIndex);
            if (closeBraceIndex < 0) {
                // parse error!
                console.log("parseActFormat: Parse error: missing close-brace for " + openBraceIndex.toString() + ".");
                return "ERROR";
            }
            else {
                var tag = str.slice(openBraceIndex + 1, closeBraceIndex);
                if (typeof dictionary[tag] !== 'undefined') {
                    result += dictionary[tag];
                } else {
                    console.log("parseActFormat: Unknown tag: " + tag);
                    result += "ERROR";
                }
                currentIndex = closeBraceIndex + 1;
            }
        }
    } while (currentIndex < str.length);

    return result;
}
*/
