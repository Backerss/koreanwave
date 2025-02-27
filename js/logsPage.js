window.logsTable;

$(document).ready(function() {
    initializeLogsTable();
    setupEventHandlers();

    // ฟังก์ชันอัพเดทสถิติ
    function updateStats() {
        $.ajax({
            url: '../../system/getLogsStats.php',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    const data = response.data;
                    
                    // อัพเดทค่าในแต่ละการ์ด
                    $('#totalActivities').text(data.totalActivities);
                    $('#activeUsers').text(data.activeUsers);
                    $('#todayActivities').text(data.todayActivities);
                    $('#avgActivities').text(data.avgActivities);
                    
                    // เพิ่มเอฟเฟคการอัพเดท
                    $('.stats-card').addClass('updated');
                    setTimeout(() => {
                        $('.stats-card').removeClass('updated');
                    }, 500);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching stats:', error);
            }
        });
    }

    // อัพเดทสถิติเมื่อโหลดหน้า
    updateStats();

    // อัพเดทสถิติเมื่อกดปุ่มรีเฟรช
    $('#refreshLogs').click(function() {
        updateStats();
        if (typeof logsTable !== 'undefined') {
            logsTable.ajax.reload();
        }
    });

    // อัพเดทสถิติทุก 5 นาที
    setInterval(updateStats, 300000);
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
            emptyTable: 'ไม่พบข้อมูล',
            info: 'แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ',
            infoEmpty: 'แสดง 0 ถึง 0 จาก 0 รายการ',
            infoFiltered: '(กรองจากทั้งหมด _MAX_ รายการ)',
            lengthMenu: 'แสดง _MENU_ รายการ',
            loadingRecords: 'กำลังโหลด...',
            processing: 'กำลังดำเนินการ...',
            search: 'ค้นหา:',
            zeroRecords: 'ไม่พบข้อมูลที่ตรงกัน',
            paginate: {
                first: 'หน้าแรก',
                last: 'หน้าสุดท้าย',
                next: 'ถัดไป',
                previous: 'ก่อนหน้า'
            }
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