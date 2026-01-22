import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from 'docx'
import PDFDocument from 'pdfkit'
import {
  CVModule,
  StructuredData,
  BasicInfoData,
  EducationData,
  WorkingExperienceData,
  ProjectExperienceData,
  PublicationData,
  LeadershipData,
  SkillsData,
} from '../types/cv'

/**
 * Generate Word document from CV modules
 */
export async function generateCVWord(
  modules: Partial<Record<CVModule, StructuredData>>,
  language: 'en' | 'zh'
): Promise<Buffer> {
  const isZh = language === 'zh'
  const children: Paragraph[] = []

  // Module labels
  const labels = {
    basicInfo: isZh ? '基本信息' : 'BASIC INFORMATION',
    education: isZh ? '教育背景' : 'EDUCATION',
    working: isZh ? '工作经历' : 'WORKING EXPERIENCE',
    project: isZh ? '项目经历' : 'PROJECT EXPERIENCE',
    publications: isZh ? '论文发表' : 'PAPER PUBLICATION',
    leadership: isZh ? '其他/领导经验' : 'LEADERSHIP EXPERIENCE/ OTHER ACHIEVEMENTS',
    skills: isZh ? '技能' : 'LANGUAGES, SKILLS & INTERESTS',
  }

  // Process basicInfo first (if exists) - it should be at the top
  if (modules.basicInfo) {
    addBasicInfoToWord(children, modules.basicInfo as BasicInfoData, isZh)
    children.push(new Paragraph({ text: '', spacing: { after: 300 } }))
  }

  // Process other modules
  for (const [moduleType, data] of Object.entries(modules)) {
    if (!data || moduleType === 'basicInfo') continue // Skip basicInfo as it's already processed

    const moduleKey = moduleType as CVModule

    // Add section heading (bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [new TextRun({ text: labels[moduleKey], bold: true, size: 19 })], // 9.5pt = 19 half-points
        spacing: { before: 400, after: 0 },
        border: {
          bottom: {
            color: '000000',
            size: 6, // 0.75pt
            space: 1,
            style: 'single',
          },
        },
      })
    )

    // Process module based on type
    switch (moduleKey) {
      case 'education':
        addEducationToWord(children, data as EducationData, isZh)
        break
      case 'working':
        addWorkingExperienceToWord(children, data as WorkingExperienceData, isZh)
        break
      case 'project':
        addProjectExperienceToWord(children, data as ProjectExperienceData, isZh)
        break
      case 'publications':
        addPublicationsToWord(children, data as PublicationData, isZh)
        break
      case 'leadership':
        addLeadershipToWord(children, data as LeadershipData, isZh)
        break
      case 'skills':
        addSkillsToWord(children, data as SkillsData, isZh)
        break
    }

    // Add spacing between sections
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }))
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.5cm in twips (1cm = 567 twips)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  })

  // Generate buffer
  return await Packer.toBuffer(doc)
}

/**
 * Generate PDF document from CV modules
 */
export async function generateCVPDF(
  modules: Partial<Record<CVModule, StructuredData>>,
  language: 'en' | 'zh'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margins: { top: 100, bottom: 100, left: 100, right: 100 }, // 2.5cm ≈ 100 points
      font: 'Helvetica',
    })

    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      resolve(Buffer.concat(buffers))
    })
    doc.on('error', reject)

    const isZh = language === 'zh'

    // Module labels
    const labels = {
      basicInfo: isZh ? '基本信息' : 'BASIC INFORMATION',
      education: isZh ? '教育背景' : 'Education Background',
      working: isZh ? '工作经历' : 'Working Experience',
      project: isZh ? '项目经历' : 'Project Experience',
      publications: isZh ? '论文发表' : 'Paper Publication',
      leadership: isZh ? '其他/领导经验' : 'LEADERSHIP EXPERIENCE/ OTHER ACHIEVEMENTS',
      skills: isZh ? '技能' : 'LANGUAGES, SKILLS & INTERESTS',
    }

    // Process basicInfo first (if exists) - it should be at the top
    if (modules.basicInfo) {
      addBasicInfoToPDF(doc, modules.basicInfo as BasicInfoData, isZh)
      doc.moveDown(1)
    }

    // Process other modules
    for (const [moduleType, data] of Object.entries(modules)) {
      if (!data || moduleType === 'basicInfo') continue // Skip basicInfo as it's already processed

      const moduleKey = moduleType as CVModule

      // Add section heading
      doc.fontSize(16).font('Helvetica-Bold').text(labels[moduleKey], { paragraphGap: 10 })
      doc.moveDown(0.5)

      // Process module based on type
      switch (moduleKey) {
        case 'education':
          addEducationToPDF(doc, data as EducationData, isZh)
          break
        case 'working':
          addWorkingExperienceToPDF(doc, data as WorkingExperienceData, isZh)
          break
        case 'project':
          addProjectExperienceToPDF(doc, data as ProjectExperienceData, isZh)
          break
        case 'publications':
          addPublicationsToPDF(doc, data as PublicationData, isZh)
          break
        case 'leadership':
          addLeadershipToPDF(doc, data as LeadershipData, isZh)
          break
        case 'skills':
          addSkillsToPDF(doc, data as SkillsData, isZh)
          break
      }

      doc.moveDown(1)
    }

    doc.end()
  })
}

// Word generation helpers

function addBasicInfoToWord(children: Paragraph[], data: BasicInfoData, isZh: boolean): void {
  // Name (bold, 13pt font size, centered)
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.name, bold: true, size: 26 })], // 13pt = 26 half-points
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
    })
  )

  // Contact information: phone and email (centered, separated by |)
  const contactInfo: string[] = []
  if (data.phone) contactInfo.push(data.phone)
  if (data.email) contactInfo.push(data.email)

  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactInfo.join(' | '), size: 19 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    )
  }

  // Links: LinkedIn and GitHub (centered, separated by |)
  const links: string[] = []
  if (data.linkedin) links.push(`LinkedIn: ${data.linkedin}`)
  if (data.github) links.push(`GitHub: ${data.github}`)

  if (links.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: links.join(' | '), size: 19 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }
}

function addEducationToWord(children: Paragraph[], data: EducationData, isZh: boolean): void {
  for (const item of data.items) {
    // School and location on same line (school left, location right, both bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.school, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.location, bold: true, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { before: 0, after: 100 },
      })
    )

    // Degree and period on same line (degree left, period right, degree bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.degree, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.period, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { after: 100 },
      })
    )

    // Major (font size 9.5)
    if (item.major) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: item.major, size: 19 })],
          spacing: { after: 100 },
        })
      )
    }

    // GPA as bullet point (left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    if (item.gpa) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${isZh ? 'GPA: ' : 'GPA: '}${item.gpa}`, size: 19 })],
          alignment: AlignmentType.LEFT,
          indent: { left: 360, hanging: 120 },
          spacing: { after: 100 },
        })
      )
    }
    
    // Honors as single bullet point (all honors combined, left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    if (item.honors && item.honors.length > 0) {
      const honorsText = item.honors.join(', ')
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${isZh ? '荣誉: ' : 'Honors: '}${honorsText}`, size: 19 })],
          alignment: AlignmentType.LEFT,
          indent: { left: 360, hanging: 120 },
          spacing: { after: 100 },
        })
      )
    }
    
    // Relevant coursework as single bullet point (left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    if (item.relevantCoursework && item.relevantCoursework.length > 0) {
      const courseworkText = item.relevantCoursework.join(', ')
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${isZh ? '相关课程: ' : 'Relevant coursework: '}${courseworkText}`, size: 19 })],
          alignment: AlignmentType.LEFT,
          indent: { left: 360, hanging: 120 },
          spacing: { after: 100 },
        })
      )
    }

    children.push(new Paragraph({ text: '', spacing: { after: 150 } }))
  }
}

function addWorkingExperienceToWord(children: Paragraph[], data: WorkingExperienceData, isZh: boolean): void {
  for (const item of data.items) {
    // Company and location on same line (company left, location right, company bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.company, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.location, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { before: 0, after: 100 },
      })
    )

    // Position and period on same line (position left, period right, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.position, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.period, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { after: 100 },
      })
    )

    // Responsibilities as bullet points (left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    for (const resp of item.responsibilities) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${resp}`, size: 19 })],
          alignment: AlignmentType.LEFT,
          indent: { left: 400, hanging: 120 },
          spacing: { after: 50 },
        })
      )
    }

    // Achievements as bullet points (left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    if (item.achievements && item.achievements.length > 0) {
      for (const achievement of item.achievements) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${achievement}`, size: 19 })],
            alignment: AlignmentType.LEFT,
            indent: { left: 400, hanging: 120 },
            spacing: { after: 50 },
          })
        )
      }
    }

    children.push(new Paragraph({ text: '', spacing: { after: 150 } }))
  }
}

function addProjectExperienceToWord(children: Paragraph[], data: ProjectExperienceData, isZh: boolean): void {
  for (const item of data.items) {
    // Project name and period on same line (name left, period right, name bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.name, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.period, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { before: 0, after: 100 },
      })
    )

    // Role if available (font size 9.5)
    if (item.role) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: item.role, size: 19 })],
          spacing: { after: 100 },
        })
      )
    }

    // Description as bullet points (left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    for (const desc of item.description) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${desc}`, size: 19 })],
          alignment: AlignmentType.LEFT,
          indent: { left: 400, hanging: 120 },
          spacing: { after: 50 },
        })
      )
    }

    // Technologies if available (font size 9.5)
    if (item.technologies && item.technologies.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${isZh ? '技术栈: ' : 'Technologies: '}${item.technologies.join(', ')}`, size: 19 })],
          spacing: { after: 100 },
        })
      )
    }

    children.push(new Paragraph({ text: '', spacing: { after: 150 } }))
  }
}

function addPublicationsToWord(children: Paragraph[], data: PublicationData, isZh: boolean): void {
  for (const item of data.items) {
    // Title and year on same line (title left, year right, title bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.title, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.year, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { before: 0, after: 100 },
      })
    )

    // Authors, journal, year (font size 9.5)
    const details: string[] = []
    if (item.authors && item.authors.length > 0) {
      details.push(item.authors.join(', '))
    }
    if (item.journal) {
      details.push(item.journal)
    }
    if (item.year) {
      details.push(item.year)
    }

    if (details.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: details.join(' • '), size: 19 })],
          spacing: { after: 100 },
        })
      )
    }

    // DOI and status if available (font size 9.5)
    const extraInfo: string[] = []
    if (item.doi) {
      extraInfo.push(`DOI: ${item.doi}`)
    }
    if (item.status) {
      extraInfo.push(item.status)
    }

    if (extraInfo.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: extraInfo.join(' • '), size: 19 })],
          spacing: { after: 100 },
        })
      )
    }

    children.push(new Paragraph({ text: '', spacing: { after: 150 } }))
  }
}

function addLeadershipToWord(children: Paragraph[], data: LeadershipData, isZh: boolean): void {
  for (const item of data.items) {
    // Organization and location on same line (organization left, location right, organization bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.organization, bold: true, size: 19 }),
          new TextRun({ text: item.location ? '\t' + item.location : '', size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { before: 0, after: 100 },
      })
    )

    // Title and period on same line (title left, period right, title bold, font size 9.5)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.title, bold: true, size: 19 }),
          new TextRun({ text: '\t' + item.period, size: 19 }),
        ],
        alignment: AlignmentType.LEFT,
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { after: 100 },
      })
    )

    // Description as bullet points (left aligned, font size 9.5)
    // Using hanging indent so text aligns with previous line text, not bullet
    for (const desc of item.description) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${desc}`, size: 19 })],
          alignment: AlignmentType.LEFT,
          indent: { left: 400, hanging: 120 },
          spacing: { after: 50 },
        })
      )
    }

    children.push(new Paragraph({ text: '', spacing: { after: 150 } }))
  }
}

function addSkillsToWord(children: Paragraph[], data: SkillsData, isZh: boolean): void {
  // Languages (bullet point, font size 9.5)
  if (data.languages) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `• ${data.languages}`, size: 19 })],
        alignment: AlignmentType.LEFT,
        indent: { left: 400, hanging: 120 },
        spacing: { before: 0, after: 100 },
      })
    )
  }

  // Skills (bullet point, font size 9.5)
  if (data.skills) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `• ${data.skills}`, size: 19 })],
        alignment: AlignmentType.LEFT,
        indent: { left: 400, hanging: 120 },
        spacing: { after: 100 },
      })
    )
  }

  // Interests (bullet point, font size 9.5)
  if (data.interests) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `• ${data.interests}`, size: 19 })],
        alignment: AlignmentType.LEFT,
        indent: { left: 400, hanging: 120 },
        spacing: { after: 100 },
      })
    )
  }
}

// PDF generation helpers

function addBasicInfoToPDF(doc: typeof PDFDocument.prototype, data: BasicInfoData, isZh: boolean): void {
  // Name (bold, larger font size, centered)
  doc.fontSize(14).font('Helvetica-Bold').text(data.name, { align: 'center' })
  doc.moveDown(0.3)

  // Contact information (phone, email, linkedin, github)
  const contactInfo: string[] = []
  if (data.phone) contactInfo.push(data.phone)
  if (data.email) contactInfo.push(data.email)
  if (data.linkedin) contactInfo.push(`LinkedIn: ${data.linkedin}`)
  if (data.github) contactInfo.push(`GitHub: ${data.github}`)

  if (contactInfo.length > 0) {
    doc.fontSize(10).font('Helvetica').text(contactInfo.join(' | '), { align: 'center' })
    doc.moveDown(0.5)
  }
}

function addEducationToPDF(doc: typeof PDFDocument.prototype, data: EducationData, isZh: boolean): void {
  doc.fontSize(12)
  for (const item of data.items) {
    // School and location (right aligned)
    doc.font('Helvetica-Bold').text(item.school, { continued: false })
    doc.font('Helvetica').text(item.location, { align: 'right' })

    // Degree and period (right aligned)
    doc.text(item.degree, { continued: false })
    doc.text(item.period, { align: 'right' })

    // Major
    if (item.major) {
      doc.text(item.major)
    }

    // GPA as bullet point
    if (item.gpa) {
      doc.text(`• ${isZh ? 'GPA: ' : 'GPA: '}${item.gpa}`, { indent: 20 })
      doc.moveDown(0.2)
    }
    
    // Honors as single bullet point (all honors combined)
    if (item.honors && item.honors.length > 0) {
      const honorsText = item.honors.join(', ')
      doc.text(`• ${isZh ? '荣誉: ' : 'Honors: '}${honorsText}`, { indent: 20 })
      doc.moveDown(0.2)
    }
    
    // Relevant coursework as single bullet point
    if (item.relevantCoursework && item.relevantCoursework.length > 0) {
      const courseworkText = item.relevantCoursework.join(', ')
      doc.text(`• ${isZh ? '相关课程: ' : 'Relevant coursework: '}${courseworkText}`, { indent: 20 })
      doc.moveDown(0.2)
    }

    doc.moveDown(0.5)
  }
}

function addWorkingExperienceToPDF(doc: typeof PDFDocument.prototype, data: WorkingExperienceData, isZh: boolean): void {
  doc.fontSize(12)
  for (const item of data.items) {
    // Company and location (right aligned)
    doc.font('Helvetica-Bold').text(item.company, { continued: false })
    doc.font('Helvetica').text(item.location, { align: 'right' })

    // Position and period (right aligned)
    doc.text(item.position, { continued: false })
    doc.text(item.period, { align: 'right' })

    // Responsibilities
    for (const resp of item.responsibilities) {
      doc.text(`• ${resp}`, { indent: 20 })
    }

    // Achievements
    if (item.achievements && item.achievements.length > 0) {
      for (const achievement of item.achievements) {
        doc.text(`• ${achievement}`, { indent: 20 })
      }
    }

    doc.moveDown(0.5)
  }
}

function addProjectExperienceToPDF(doc: typeof PDFDocument.prototype, data: ProjectExperienceData, isZh: boolean): void {
  doc.fontSize(12)
  for (const item of data.items) {
    // Project name and period (right aligned)
    doc.font('Helvetica-Bold').text(item.name, { continued: false })
    doc.font('Helvetica').text(item.period, { align: 'right' })

    // Role
    if (item.role) {
      doc.text(item.role)
    }

    // Description
    for (const desc of item.description) {
      doc.text(`• ${desc}`, { indent: 20 })
    }

    // Technologies
    if (item.technologies && item.technologies.length > 0) {
      doc.text(`${isZh ? '技术栈: ' : 'Technologies: '}${item.technologies.join(', ')}`)
    }

    doc.moveDown(0.5)
  }
}

function addPublicationsToPDF(doc: typeof PDFDocument.prototype, data: PublicationData, isZh: boolean): void {
  doc.fontSize(12)
  for (const item of data.items) {
    // Title
    doc.font('Helvetica-Bold').text(item.title)

    // Authors, journal, year
    const details: string[] = []
    if (item.authors && item.authors.length > 0) {
      details.push(item.authors.join(', '))
    }
    if (item.journal) {
      details.push(item.journal)
    }
    if (item.year) {
      details.push(item.year)
    }

    if (details.length > 0) {
      doc.font('Helvetica').text(details.join(' • '))
    }

    // DOI and status
    const extraInfo: string[] = []
    if (item.doi) {
      extraInfo.push(`DOI: ${item.doi}`)
    }
    if (item.status) {
      extraInfo.push(item.status)
    }

    if (extraInfo.length > 0) {
      doc.text(extraInfo.join(' • '))
    }

    doc.moveDown(0.5)
  }
}

function addLeadershipToPDF(doc: typeof PDFDocument.prototype, data: LeadershipData, isZh: boolean): void {
  doc.fontSize(12)
  for (const item of data.items) {
    // Organization and location (right aligned)
    doc.font('Helvetica-Bold').text(item.organization, { continued: false })
    if (item.location) {
      doc.font('Helvetica').text(item.location, { align: 'right' })
    }

    // Title and period (right aligned)
    doc.font('Helvetica-Bold').text(item.title, { continued: false })
    doc.font('Helvetica').text(item.period, { align: 'right' })

    // Description
    for (const desc of item.description) {
      doc.text(`• ${desc}`, { indent: 20 })
    }

    doc.moveDown(0.5)
  }
}

function addSkillsToPDF(doc: typeof PDFDocument.prototype, data: SkillsData, isZh: boolean): void {
  doc.fontSize(12)
  
  // Languages (bullet point)
  if (data.languages) {
    doc.font('Helvetica').text(`• ${data.languages}`, { indent: 20 })
    doc.moveDown(0.3)
  }

  // Skills (bullet point)
  if (data.skills) {
    doc.font('Helvetica').text(`• ${data.skills}`, { indent: 20 })
    doc.moveDown(0.3)
  }

  // Interests (bullet point)
  if (data.interests) {
    doc.font('Helvetica').text(`• ${data.interests}`, { indent: 20 })
    doc.moveDown(0.3)
  }
}
