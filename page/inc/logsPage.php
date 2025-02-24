<div class="page" id="logsPage">
    <div class="card">
        <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-history me-2"></i>บันทึกการใช้งานระบบ
                </h5>
                <div class="btn-group">
                    <button class="btn btn-primary btn-sm" id="refreshLogs">
                        <i class="fas fa-sync-alt me-1"></i>รีเฟรช
                    </button>
                    <button class="btn btn-secondary btn-sm" id="exportLogs">
                        <i class="fas fa-download me-1"></i>ส่งออก
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card-body">
            <!-- Advanced Filters -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <label class="form-label">โมดูล</label>
                    <select class="form-select" id="moduleFilter">
                        <option value="">ทั้งหมด</option>
                        <option value="users">ผู้ใช้งาน</option>
                        <option value="lessons">บทเรียน</option>
                        <option value="learning">การเรียนรู้</option>
                        <option value="exams">แบบทดสอบ</option>
                        <option value="system">ระบบ</option>
                    </select>
                </div>
                
                <div class="col-md-3">
                    <label class="form-label">ประเภทกิจกรรม</label>
                    <select class="form-select" id="actionFilter">
                        <option value="">ทั้งหมด</option>
                        <option value="login">เข้าสู่ระบบ</option>
                        <option value="logout">ออกจากระบบ</option>
                        <option value="create">สร้าง</option>
                        <option value="update">แก้ไข</option>
                        <option value="delete">ลบ</option>
                        <option value="view">ดู</option>
                    </select>
                </div>
                
                <div class="col-md-3">
                    <label class="form-label">ตั้งแต่วันที่</label>
                    <input type="date" class="form-control" id="dateFrom">
                </div>
                
                <div class="col-md-3">
                    <label class="form-label">ถึงวันที่</label>
                    <input type="date" class="form-control" id="dateTo">
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h6 class="card-title">กิจกรรมทั้งหมด</h6>
                            <h3 id="totalActivities">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h6 class="card-title">ผู้ใช้ที่ใช้งานวันนี้</h6>
                            <h3 id="activeUsers">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6 class="card-title">กิจกรรมวันนี้</h6>
                            <h3 id="todayActivities">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h6 class="card-title">เฉลี่ยต่อวัน</h6>
                            <h3 id="avgActivities">0</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logs Table -->
            <div class="table-responsive">
                <table class="table table-hover" id="logsTable">
                    <thead>
                        <tr>
                            <th>วันที่-เวลา</th>
                            <th>ผู้ใช้</th>
                            <th>กิจกรรม</th>
                            <th>โมดูล</th>
                            <th>รายละเอียด</th>
                            <th>IP Address</th>
                            <th>การเปลี่ยนแปลง</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Change Details Modal -->
    <div class="modal fade" id="changeDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">รายละเอียดการเปลี่ยนแปลง</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>ค่าเดิม</h6>
                            <pre id="oldValues" class="bg-light p-2 rounded"></pre>
                        </div>
                        <div class="col-md-6">
                            <h6>ค่าใหม่</h6>
                            <pre id="newValues" class="bg-light p-2 rounded"></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>