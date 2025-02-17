<div class="page" id="logsPage">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">บันทึกการใช้งานระบบ</h5>
            <div class="filter-group">
                <button class="btn btn-secondary btn-sm" id="refreshLogs">
                    <i class="fas fa-sync-alt"></i> รีเฟรช
                </button>
            </div>
        </div>
        <div class="card-body">
            <!-- Filters -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <label class="form-label">โมดูล</label>
                    <select class="form-select form-select-sm" id="moduleFilter">
                        <option value="">ทั้งหมด</option>
                        <option value="users">จัดการผู้ใช้</option>
                        <option value="lessons">จัดการบทเรียน</option>
                        <option value="vocabulary">จัดการคำศัพท์</option>
                        <option value="exams">จัดการข้อสอบ</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">การกระทำ</label>
                    <select class="form-select form-select-sm" id="actionFilter">
                        <option value="">ทั้งหมด</option>
                        <option value="create">เพิ่ม</option>
                        <option value="update">แก้ไข</option>
                        <option value="delete">ลบ</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">จากวันที่</label>
                    <input type="date" class="form-control form-control-sm" id="dateFrom">
                </div>
                <div class="col-md-3">
                    <label class="form-label">ถึงวันที่</label>
                    <input type="date" class="form-control form-control-sm" id="dateTo">
                </div>
            </div>

            <!-- Logs Table -->
            <div class="table-responsive">
                <table class="table table-striped table-hover" id="logsTable">
                    <thead>
                        <tr>
                            <th>วันที่-เวลา</th>
                            <th>ผู้ใช้</th>
                            <th>การกระทำ</th>
                            <th>โมดูล</th>
                            <th>รายละเอียด</th>
                            <th>การเปลี่ยนแปลง</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</div>