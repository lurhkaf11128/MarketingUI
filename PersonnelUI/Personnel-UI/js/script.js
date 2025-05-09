// ====== API Base URL ======
// const apiBaseUrl = "https://localhost:5001/api"; // Change if needed
const apiBaseUrl = "https://localhost:7006/api";

// ====== Global State ======
let selectedPersonnelId = null;

// ====== Load Personnel List ======
function loadPersonnel() {
    $.get(`${apiBaseUrl}/personnel`, function (data) {
        const tbody = $("#personnelTable tbody");
        tbody.empty();
        data.forEach(person => {
            tbody.append(`
                <tr data-id="${person.id}">
                    <td>${person.name}</td>
                    <td>${person.age}</td>
                    <td>${person.phone}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-edit">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete">Delete</button>
                    </td>
                </tr>
            `);
        });
    });
}

// ====== Load Sales List ======
function loadSales(personnelId) {
    $.get(`${apiBaseUrl}/sales/personnel/${personnelId}`, function (data) {
        const tbody = $("#salesTable tbody");
        tbody.empty();
        if (data.length === 0) {
            tbody.append(`<tr><td colspan="3" class="text-center">No sales data</td></tr>`);
        } else {
            data.forEach(sale => {
                tbody.append(`
                    <tr data-id="${sale.id}">
                        <td>${sale.reportDate.split('T')[0]}</td>
                        <td>${sale.salesAmount.toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm btn-danger btn-delete-sale">Delete</button>
                        </td>
                    </tr>
                `);
            });
        }
    });
}

// ====== Add or Update Personnel ======
$("#personnelForm").submit(function (e) {
    e.preventDefault();
    const id = $("#personnelId").val();
    const payload = {
        name: $("#personnelName").val(),
        age: parseInt($("#personnelAge").val()),
        phone: $("#personnelPhone").val()
    };

    if (payload.age <= 18) {
        alert("Age must be above 18");
        return;
    }

    if (id) {
        // Update
        $.ajax({
            url: `${apiBaseUrl}/personnel/${id}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function () {
                $("#personnelModal").modal("hide");
                loadPersonnel();
            }
        });
    } else {
        // Add
        $.ajax({
            url: `${apiBaseUrl}/personnel`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function () {
                $("#personnelModal").modal("hide");
                loadPersonnel();
            }
        });
    }
});

// ====== Add Sales ======
$("#salesForm").submit(function (e) {
    e.preventDefault();
    const payload = {
        personnelId: selectedPersonnelId,
        reportDate: $("#reportDate").val(),
        salesAmount: parseFloat($("#salesAmount").val())
    };

    $.ajax({
        url: `${apiBaseUrl}/sales`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function () {
            $("#salesModal").modal("hide");
            loadSales(selectedPersonnelId);
        }
    });
});

// ====== Handle Table Events ======

// Personnel table click
// $("#personnelTable").on("click", "tr", function () {
//     const id = $(this).data("id");
//     selectedPersonnelId = id;
//     $("#salesTitle").text(`Sales Records for Personnel ID: ${id}`);
//     $("#btnAddSales").prop("disabled", false);
//     loadSales(id);
// });

$("#personnelTable").on("click", "tr", function () {
  const id = $(this).data("id");
  selectedPersonnelId = id;
  $("#salesTitle").text(`Sales Records for Personnel ID: ${id}`);
  $("#btnAddSales").prop("disabled", false);
  loadSales(id);

  // 🔥 Highlight the selected row
  $("#personnelTable tbody tr").removeClass("table-active"); // Remove highlight from all
  $(this).addClass("table-active"); // Add highlight to clicked one
});

// Edit personnel button
$("#personnelTable").on("click", ".btn-edit", function (e) {
    e.stopPropagation();
    const row = $(this).closest("tr");
    const id = row.data("id");
    const name = row.find("td:nth-child(1)").text();
    const age = row.find("td:nth-child(2)").text();
    const phone = row.find("td:nth-child(3)").text();

    $("#personnelId").val(id);
    $("#personnelName").val(name);
    $("#personnelAge").val(age);
    $("#personnelPhone").val(phone);
    $("#personnelModalLabel").text("Edit Personnel");
    $("#personnelModal").modal("show");
});

// Delete personnel button
$("#personnelTable").on("click", ".btn-delete", function (e) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this personnel? Sales data will also be deleted.")) {
        const id = $(this).closest("tr").data("id");
        $.ajax({
            url: `${apiBaseUrl}/personnel/${id}`,
            type: "DELETE",
            success: function () {
                loadPersonnel();
                if (id === selectedPersonnelId) {
                    $("#salesTitle").text("Sales Records");
                    $("#salesTable tbody").empty();
                    $("#btnAddSales").prop("disabled", true);
                }
            }
        });
    }
});

// Delete sales button
$("#salesTable").on("click", ".btn-delete-sale", function () {
    if (confirm("Are you sure you want to delete this sales record?")) {
        const id = $(this).closest("tr").data("id");
        $.ajax({
            url: `${apiBaseUrl}/sales/${id}`,
            type: "DELETE",
            success: function () {
                loadSales(selectedPersonnelId);
            }
        });
    }
});

// Add Personnel button
$("#btnAddPersonnel").click(function () {
    $("#personnelForm")[0].reset();
    $("#personnelId").val('');
    $("#personnelModalLabel").text("Add Personnel");
    $("#personnelModal").modal("show");
});

// Add Sales button
$("#btnAddSales").click(function () {
    $("#salesForm")[0].reset();
    $("#salesModal").modal("show");
});

// ====== Initial Load ======
$(document).ready(function () {
    loadPersonnel();
});
