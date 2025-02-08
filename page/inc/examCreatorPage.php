<style>
    .exam-creator {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .exam-form {
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .exam-settings {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
    }

    .question-builder {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
    }

    .option-group {
        margin-top: 15px;
    }

    .option-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }

    .correct-answer {
        margin-top: 15px;
        padding: 15px;
        background: #e8f5e9;
        border-radius: 8px;
    }
</style>
<div class="page" id="examCreatorPage">

    <div class="alert alert-info" role="alert">
      <i class="fas fa-info-circle me-2"></i>
      <span>แต่ละบทเรียนสามารถสร้างข้อสอบแต่ละประเภทได้เพียงครั้งเดียวเท่านั้น</span>
    </div>

  <div class="exam-creator">
    <h3 class="mb-4">
      <i class="fas fa-edit me-2"></i>สร้างข้อสอบ
    </h3>
    
    <div id="examForm" class="exam-form">
      <div class="exam-settings">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">ประเภทข้อสอบ</label>
              <select class="form-select" id="examType">
                <option value="">เลือกประเภท</option>
                <option value="pretest">แบบทดสอบก่อนเรียน</option>
                <option value="posttest">แบบทดสอบหลังเรียน</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">บทเรียน</label>
              <select class="form-select" id="lessonSelect">
                <option value="">เลือกบทเรียน</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div id="questionList"></div>

      <div class="text-end mt-3">
        <button type="button" id="addQuestion" class="btn btn-secondary me-2">
          <i class="fas fa-plus me-1"></i>เพิ่มข้อสอบ
        </button>
        <button type="button" id="saveExam" class="btn btn-primary">
          <i class="fas fa-save me-1"></i>บันทึกข้อสอบ
        </button>
      </div>
    </div>

    <div class="exam-list mt-4">
      <h4 class="mb-3">
        <i class="fas fa-list me-2"></i>รายการข้อสอบ
      </h4>
      
      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">เลือกบทเรียน</label>
            <select class="form-select" id="examListLessonSelect">
              <option value="">ทั้งหมด</option>
            </select>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>บทเรียน</th>
                  <th>ประเภท</th>
                  <th>จำนวนข้อ</th>
                  <th>วันที่สร้าง</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody id="examListBody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  

  <!-- Template สำหรับข้อสอบ -->
  <template id="questionTemplate">
    <div class="question-builder mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="question-number mb-0">ข้อที่ {number}</h5>
        <button type="button" class="btn btn-danger btn-sm remove-question">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="mb-3">
        <label class="form-label">คำถาม</label>
        <textarea class="form-control question-text" rows="2"></textarea>
      </div>

      <div class="option-group">
        <label class="form-label">ตัวเลือก</label>
        <div class="option-item">
          <span class="option-letter">A</span>
          <input type="text" class="form-control option-input" data-option="A">
        </div>
        <div class="option-item">
          <span class="option-letter">B</span>
          <input type="text" class="form-control option-input" data-option="B">
        </div>
        <div class="option-item">
          <span class="option-letter">C</span>
          <input type="text" class="form-control option-input" data-option="C">
        </div>
        <div class="option-item">
          <span class="option-letter">D</span>
          <input type="text" class="form-control option-input" data-option="D">
        </div>
      </div>

      <div class="correct-answer">
        <label class="form-label">เฉลย</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input class="form-check-input correct-option" type="radio" name="correct_{number}" value="A">
            <label class="form-check-label">A</label>
          </div>
          <div class="form-check">
            <input class="form-check-input correct-option" type="radio" name="correct_{number}" value="B">
            <label class="form-check-label">B</label>
          </div>
          <div class="form-check">
            <input class="form-check-input correct-option" type="radio" name="correct_{number}" value="C">
            <label class="form-check-label">C</label>
          </div>
          <div class="form-check">
            <input class="form-check-input correct-option" type="radio" name="correct_{number}" value="D">
            <label class="form-check-label">D</label>
          </div>
        </div>
      </div>
    </div>
  </template>
</div>