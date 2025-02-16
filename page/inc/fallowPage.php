<div class="page" id="fallowPage">
    <div class="container-fluid">
        <!-- Page Header -->
        <div class="page-header mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h3 class="page-title">
                        <i class="fas fa-chart-bar me-2"></i>ติดตามผลการเรียน
                    </h3>
                    <p class="text-muted mb-0">ระบบติดตามความก้าวหน้าของผู้เรียน</p>
                </div>
                <div class="header-actions">
                    <div class="filters d-flex gap-2">
                        <select class="form-select" id="gradeFilter">
                            <option value="">ทุกระดับชั้น</option>
                            <?php for($i=1; $i<=6; $i++): ?>
                                <option value="<?php echo $i; ?>">ม.<?php echo $i; ?></option>
                            <?php endfor; ?>
                        </select>
                        <select class="form-select" id="classFilter">
                            <option value="">ทุกห้อง</option>
                            <?php for($i=1; $i<=5; $i++): ?>
                                <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                            <?php endfor; ?>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-primary">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stats-info">
                        <h5>นักเรียนทั้งหมด</h5>
                        <h3 id="totalStudents">0</h3>
                        <small class="text-muted">แบ่งเป็นชาย: <span id="maleCount">0</span> หญิง: <span id="femaleCount">0</span></small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stats-info">
                        <h5>เรียนจบแล้ว</h5>
                        <h3><span id="completedStudents">0</span> <small class="text-muted">คน</small></h3>
                        <div class="progress mt-2" style="height: 5px;">
                            <div id="completedProgress" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
                        </div>
                        <small class="text-muted">คิดเป็น <span id="completedPercentage">0</span>% ของทั้งหมด</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stats-info">
                        <h5>กำลังเรียน</h5>
                        <h3><span id="inProgressStudents">0</span> <small class="text-muted">คน</small></h3>
                        <small class="text-success"><span id="activeToday">0</span> คนเรียนวันนี้</small>
                        <small class="text-muted ms-2">|</small>
                        <small class="text-danger ms-2"><span id="inactiveWeek">0</span> คนไม่มีความคืบหน้า 7 วัน</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-icon bg-info">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stats-info">
                        <h5>ผลการเรียน</h5>
                        <h3><span id="averageScore">0</span>%</h3>
                        <div class="d-flex justify-content-between mt-1">
                            <small class="text-muted">สูงสุด: <span id="highestScore">0</span>%</small>
                            <small class="text-muted">ต่ำสุด: <span id="lowestScore">0</span>%</small>
                        </div>
                        <div class="progress mt-2" style="height: 5px;">
                            <div id="scoreProgress" class="progress-bar bg-info" role="progressbar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students Progress Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table id="studentsProgressTable" class="table table-hover">
                        <thead>
                            <tr>
                                <th>รหัสนักเรียน</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>ชั้น/ห้อง</th>
                                <th>ความก้าวหน้า</th>
                                <th>คะแนนก่อนเรียน</th>
                                <th>คะแนนหลังเรียน</th>
                                <th>พัฒนาการ</th>
                                <th>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Student Details Modal -->
    <div class="modal fade" id="studentDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">รายละเอียดการเรียน</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="student-info mb-4"></div>
                    <div class="lessons-progress"></div>
                </div>
            </div>
        </div>
    </div>
</div>