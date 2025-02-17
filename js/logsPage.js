window.logsTable;

$(document).ready(function() {
    initializeLogsTable();
    setupEventHandlers();
});

function initializeLogsTable() {
    if ($.fn.DataTable.isDataTable('#logsTable')) {
        $('#logsTable').DataTable().destroy();
    }

    logsTable = $('#logsTable').DataTable({
        processing: true,
        serverSide: false,
        ajax: {
            url: '../../system/getLogs.php',
            data: function(d) {
                return {
                    module: $('#moduleFilter').val(),
                    action: $('#actionFilter').val(),
                    date_from: $('#dateFrom').val(),
                    date_to: $('#dateTo').val()
                };
            },
            dataSrc: 'data'
        },
        columns: [
            {
                data: 'created_at',
                render: data => new Date(data).toLocaleString('th-TH')
            },
            {
                data: null,
                render: data => `${data.first_name} ${data.last_name} (${data.role})`
            },
            {
                data: 'action',
                render: data => {
                    const badges = {
                        'create': '<span class="badge bg-success">เพิ่ม</span>',
                        'update': '<span class="badge bg-warning">แก้ไข</span>',
                        'delete': '<span class="badge bg-danger">ลบ</span>'
                    };
                    return badges[data] || data;
                }
            },
            {
                data: 'module',
                render: data => {
                    const modules = {
                        'users': 'จัดการผู้ใช้',
                        'lessons': 'จัดการบทเรียน',
                        'vocabulary': 'จัดการคำศัพท์',
                        'exams': 'จัดการข้อสอบ'
                    };
                    return modules[data] || data;
                }
            },
            { data: 'description' },
            {
                data: null,
                render: function(data) {
                    if (data.old_values || data.new_values) {
                        return `<button class="btn btn-sm btn-info view-changes" 
                                data-old='${data.old_values}' 
                                data-new='${data.new_values}'>
                                ดูการเปลี่ยนแปลง</button>`;
                    }
                    return '-';
                }
            }
        ],
        order: [[0, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/th.json'
        },
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "ทั้งหมด"]]
    });
}

function setupEventHandlers() {
    // Filter handlers
    $('#moduleFilter, #actionFilter, #dateFrom, #dateTo').on('change', function() {
        logsTable.ajax.reload();
    });

    // Refresh button handler
    $('#refreshLogs').on('click', function() {
        logsTable.ajax.reload();
    });

    // View changes button handler
    $(document).on('click', '.view-changes', function() {
        const oldValues = $(this).data('old');
        const newValues = $(this).data('new');
        showChangesModal(oldValues, newValues);
    });
}

function showChangesModal(oldValues, newValues) {
    let changesHtml = '<div class="changes-comparison">';
    
    if (oldValues && newValues) {
        const oldObj = typeof oldValues === 'string' ? JSON.parse(oldValues) : oldValues;
        const newObj = typeof newValues === 'string' ? JSON.parse(newValues) : newValues;
        
        Object.keys(newObj).forEach(key => {
            if (oldObj[key] !== newObj[key]) {
                changesHtml += `
                    <div class="change-item">
                        <div class="field-name">${key}:</div>
                        <div class="old-value">เดิม: ${oldObj[key] || '-'}</div>
                        <div class="new-value">ใหม่: ${newObj[key] || '-'}</div>
                    </div>
                `;
            }
        });
    }
    
    changesHtml += '</div>';
    
    Swal.fire({
        title: 'การเปลี่ยนแปลง',
        html: changesHtml,
        width: 600,
        confirmButtonText: 'ปิด'
    });
}