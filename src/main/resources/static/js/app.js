var api = apiclient;
var ws;
var app = (function () {
    var author = "";
    var blueprints = [];
    var creatingNewBlueprint = false;
    var newBlueprintName = null;

    function initWebSocket() {
        ws = new WebSocket("ws://localhost:8080/ws/blueprints");

        ws.onopen = function() {
            console.log("WebSocket connected!");
        }

        ws.onmessage = function(evt) {
            const point = JSON.parse(evt.data);
            if (point.author && point.blueprintName) {
                blueprintModule.addPointFromWS(point.x, point.y);
            }
        }

        ws.onerror = function(err) {
            console.error("WebSocket error:", err);
        }
    }



    var setAuthor = function (newAuthor) {
        author = newAuthor;
        $("#selectedAuthor").text(author);
        $("#currentBlueprintName").text("—");
        blueprintModule.clearCurrentBlueprint(); 
        $("#blueprintsTable tbody").empty(); 
        $("#totalPoints").text("0");
    };

    var updateBlueprints = function (authname) {
        api.getBlueprintsByAuthor(authname)
            .then(function (data) {
                if (!data || data.length === 0) {
                    $("#blueprintsTable tbody").empty();
                    $("#totalPoints").text("0");
                    $("#selectedAuthor").text(authname);
                    $("#currentBlueprintName").text("—");
                    blueprintModule.clearCurrentBlueprint();
                    alert("No se encontraron planos para el autor: " + authname);
                    return;
                }

                blueprints = data.map(function (bp) {
                    return { name: bp.name, points: bp.points.length };
                });

                $("#blueprintsTable tbody").empty();

                blueprints.forEach(function (bp) {
                    $("#blueprintsTable tbody").append(
                        `<tr>
                            <td>${bp.name}</td>
                            <td>${bp.points}</td>
                            <td><button class="btn btn-info" onclick="app.drawBlueprint('${authname}', '${bp.name}')">Open</button></td>
                        </tr>`
                    );
                });

                var totalPoints = blueprints.reduce(function (sum, bp) {
                    return sum + bp.points;
                }, 0);

                $("#totalPoints").text(totalPoints);
            })
            .catch(function (error) {
                if (error.status === 404) {
                    alert("The user '" + authname + "' has no associated blueprints.");
                } else {
                    alert("Error loading blueprints: " + error.statusText || error);
                }
            });
    };

    var updatePointCount = function(blueprintName, pointCount) {
        // Update the specific blueprint row
        $("#blueprintsTable tbody tr").each(function() {
            if ($(this).find("td").first().text() === blueprintName) {
                $(this).find("td").eq(1).text(pointCount);
            }
        });

        // Recalculate total points
        var total = 0;
        $("#blueprintsTable tbody tr td:nth-child(2)").each(function() {
            total += parseInt($(this).text()) || 0;
        });
        $("#totalPoints").text(total);
    };

    var drawBlueprint = function (author, blueprintName) {
        api.getBlueprintsByNameAndAuthor(author, blueprintName)
            .then(function (blueprint) {
                $("#currentBlueprintName").text(blueprint.name);

                blueprintModule.setCurrentBlueprint({
                    author: author,
                    name: blueprint.name,
                    points: blueprint.points
                });
                // Set up the callback for point updates
                blueprintModule.setOnPointAddedCallback(updatePointCount);
                // Update initial point count
                updatePointCount(blueprint.name, blueprint.points.length);
            })
            .catch(function (error) {
                alert("Error loading blueprint: " + (error.statusText || error));
            });
    };

    var createNewBlueprint = function() {
        var inputAuthor = prompt("Enter the author's name:");
        if (!inputAuthor) {
            alert("Author name is required.");
            return;
        }

        var name = prompt("Enter the name for the new blueprint:");
        if (!name) {
            alert("Blueprint name is required.");
            return;
        }

        author = inputAuthor;
        blueprints = [];
        creatingNewBlueprint = true;
        newBlueprintName = name;

        $("#selectedAuthor").text(author);
        $("#currentBlueprintName").text(name);
        $("#blueprintsTable tbody").empty();
        $("#totalPoints").text("0");

        var newBp = {
            author: author,
            name: name,
            points: []
        };

        $("#blueprintsTable tbody").append(
            `<tr>
                <td>${name}</td>
                <td>0</td>
                <td><button class="btn btn-info" onclick="app.drawBlueprint('${author}', '${name}')">Open</button></td>
            </tr>`
        );

        var total = 0;
        $("#blueprintsTable tbody tr td:nth-child(2)").each(function() {
            total += parseInt($(this).text()) || 0;
        });
        $("#totalPoints").text(total);

        blueprintModule.setCurrentBlueprint(newBp);
        blueprintModule.setOnPointAddedCallback(updatePointCount);
        $("#saveButton").prop("disabled", false);

        alert("You can now draw points on the canvas.");
    };


    var saveCurrentBlueprint = function() {
        var currentBp = blueprintModule.getCurrentBlueprint();
        if (!currentBp) {
            alert("No blueprint selected!");
            return;
        }

        if (!currentBp.author || !currentBp.name) {
            alert("Blueprint must have an author and a name.");
            return;
        }

        if (creatingNewBlueprint) {
            api.createBlueprint(currentBp)
                .then(function() {
                    creatingNewBlueprint = false;
                    newBlueprintName = null;
                    return api.getBlueprintsByAuthor(currentBp.author);
                })
                .then(function(data) {
                    blueprints = data.map(bp => ({ name: bp.name, points: bp.points.length }));

                    $("#blueprintsTable tbody").empty();
                    blueprints.forEach(function (bp) {
                        $("#blueprintsTable tbody").append(
                            `<tr>
                                <td>${bp.name}</td>
                                <td>${bp.points}</td>
                                <td><button class="btn btn-info" onclick="app.drawBlueprint('${currentBp.author}', '${bp.name}')">Open</button></td>
                            </tr>`
                        );
                    });

                    var totalPoints = blueprints.reduce((sum, bp) => sum + bp.points, 0);
                    $("#totalPoints").text(totalPoints);
                    alert("Blueprint created and saved successfully!");
                })
                .catch(function(error) {
                    console.error("Error creating blueprint:", error);
                    alert("Error creating blueprint: " + (error.statusText || error.message || error));
                });
        } else {
            api.updateBlueprint(currentBp.author, currentBp.name, currentBp)
                .then(function() {
                    return api.getBlueprintsByAuthor(currentBp.author);
                })
                .then(function() {
                    updateBlueprints(currentBp.author);
                    alert("Blueprint updated successfully!");
                })
                .catch(function(error) {
                    console.error("Error updating blueprint:", error);
                    alert("Error saving blueprint: " + (error.statusText || error.message || error));
                });
        }
    };
    var deleteCurrentBlueprint = function() {
        var currentBp = blueprintModule.getCurrentBlueprint();
        if (!currentBp) {
            alert("No blueprint selected to delete!");
            return;
        }

        var confirmDelete = confirm(
            `Are you sure you want to delete the blueprint "${currentBp.name}" by ${currentBp.author}?`
        );
        if (!confirmDelete) return;

        $("#deleteButton").prop("disabled", true);
        $("#saveButton").prop("disabled", true);

        api.deleteBlueprint(currentBp.author, currentBp.name)
            .then(function() {
                return api.getBlueprintsByAuthor(currentBp.author);
            })
            .then(function(data) {
                $("#blueprintsTable tbody").empty();
                if (!data || data.length === 0) {
                    $("#totalPoints").text("0");

                    blueprintModule.clearCurrentBlueprint();
                    $("#currentBlueprintName").text("—");

                    alert("Blueprint deleted successfully. No more blueprints for this author.");
                    return;
                }

                blueprints = data.map(bp => ({ name: bp.name, points: bp.points.length }));

                blueprints.forEach(function(bp) {
                    $("#blueprintsTable tbody").append(
                        `<tr>
                            <td>${bp.name}</td>
                            <td>${bp.points}</td>
                            <td><button class="btn btn-info" onclick="app.drawBlueprint('${currentBp.author}', '${bp.name}')">Open</button></td>
                        </tr>`
                    );
                });

                var totalPoints = blueprints.reduce((sum, bp) => sum + bp.points, 0);
                $("#totalPoints").text(totalPoints);

                alert(`Blueprint "${currentBp.name}" deleted successfully!`);
            })
            .catch(function(error) {
                console.error("Error deleting blueprint:", error);
                alert("Error deleting blueprint: " + (error.statusText || error.message || error));
            });
    };


    return {
        setAuthor: setAuthor,
        updateBlueprints: updateBlueprints,
        drawBlueprint: drawBlueprint,
        saveCurrentBlueprint: saveCurrentBlueprint,
        createNewBlueprint: createNewBlueprint,
        deleteCurrentBlueprint: deleteCurrentBlueprint,
        initWebSocket: initWebSocket
    };

})();
