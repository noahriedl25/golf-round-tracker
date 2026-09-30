"""Build the developer reference using ReportLab, with one topic per page.

Run with a Python environment containing reportlab and pypdf:
    python tools/build_guide.py
The app itself does not need these documentation-only dependencies.
"""

from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted,
    KeepTogether, Table, TableStyle,
)
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/golf-tracker-explained.pdf"

# Human-written descriptions, checked against the source. New functions cause
# a clear build error instead of silently disappearing from the guide.
FUNCTIONS = {
    "createHonEKorCourse": "Build all three nines using the yardages for the selected tee color.",
    "getSavedCourses": "Read saved course JSON; keep valid cards and exclude obsolete Hon-E-Kor imports.",
    "getFavoriteCourseIds": "Read the stored list of favorite IDs and discard invalid entries.",
    "isFavoriteCourse": "Answer whether a course ID is in that favorite list.",
    "toggleFavoriteCourse": "Add or remove the selected favorite; refresh its label and home shortcuts.",
    "isValidCourse": "Check a course object's required fields and hole data before trusting it.",
    "loadSavedCourses": "Load stored cards into the courses object and course dropdown.",
    "saveCourse": "Insert or replace a saved course by ID, then update the dropdown.",
    "addCourseOption": "Create or refresh one dropdown option for a course.",
    "getCourseOptionLabel": "Build a readable label with favorite mark, name, and tee.",
    "selectSavedCourse": "Select the matching course and update layout choices and summary.",
    "updateRoundFormatOptions": "Offer valid full-round, front/back-nine, or ordered multi-nine choices.",
    "getRoundSelection": "Return the actual hole list and label for the chosen layout.",
    "updateSelectedCourseCard": "Show selected course, tee, layout, total par, and yardage.",
    "updateCourseActionButtons": "Enable favorite controls and show editing only for supported courses.",
    "searchCourses": "Submit name text to the course service, filter U.S. results, and handle failure.",
    "setSearchLoading": "Disable name, ZIP, and location search buttons during an active search.",
    "renderCourseSearchResults": "Build clickable results with name, city/state, and distance when supplied.",
    "loadCourseDetails": "Fetch a result's scorecard and tees; route Hon-E-Kor to built-in verified layouts.",
    "loadHonEKorDetails": "Prepare the three tee choices and multi-nine options for Hon-E-Kor.",
    "getTeeLabel": "Build a readable tee label from the provider's tee metadata.",
    "selectApiTee": "Translate API tee/hole data into an app course and save the selected card.",
    "editSelectedCourse": "Find the selected saved card and open its editing form.",
    "showCustomCourse": "Open the add/edit screen and populate inputs when editing an existing card.",
    "renderCustomHoleRows": "Create editable hole rows matching the selected hole count.",
    "saveCustomCourse": "Validate custom course inputs, construct the card, and store it.",
    "changeNumberInput": "Apply a plus/minus change without going below the allowed minimum.",
    "saveActiveRound": "Serialize the active course, hole index, scores, weather, and token locally.",
    "startRound": "Confirm draft replacement, initialize the chosen holes, and begin scoring/weather lookup.",
    "displayCurrentHole": "Fill the scoring controls and progress display for the current hole.",
    "saveHoleAndContinue": "Validate entered values, save the hole, and advance or finish the round.",
    "saveCurrentHoleWithoutValidation": "Capture usable draft input values without the full next-hole validation step.",
    "goToPreviousHole": "Preserve current inputs, move back one hole, and redraw the form.",
    "saveInputProgress": "Save changed inputs and refresh the current score while a round is active.",
    "checkForSavedRound": "Show or hide resume controls based on a valid stored draft.",
    "getValidSavedRound": "Parse and validate draft JSON and restore a usable course snapshot.",
    "resumeSavedRound": "Restore active-round state and display its saved hole.",
    "saveRoundAndGoHome": "Preserve current entries and the draft before returning to Home.",
    "discardSavedRound": "Confirm removal of the active draft and clear the resume UI.",
    "showScorecardOverview": "Save current inputs and open an overview of the active round's holes.",
    "captureRoundConditions": "Request a weather snapshot and ignore results belonging to an older round token.",
    "getCourseCoordinates": "Use known course coordinates or ask for device location as a fallback.",
    "renderRoundConditions": "Display the captured weather in the active-round screen.",
    "getCardinalDirection": "Convert wind degrees into a compass label such as N or SW.",
    "getWeatherLabel": "Convert the weather service's numeric condition code to readable words.",
    "formatConditions": "Produce the short temperature and wind label used on history cards.",
    "getRoundHistory": "Read completed history JSON and filter invalid records.",
    "getCareerStart": "Return a valid stored career date, or null for all history.",
    "getCareerHistory": "Keep completed rounds on or after the career start date.",
    "resetCareerStatistics": "Require two confirmations and RESET; save a new start date and previous period.",
    "undoCareerReset": "Confirm and restore the previous career period, then remove the undo marker.",
    "isValidCompletedRound": "Check that a history object has the fields and numeric hole values the UI needs.",
    "saveCompletedRound": "Prepend a finished card to history and call the shared save function.",
    "saveRoundHistory": "Save locally first; in Python mode queue an ordered database snapshot save.",
    "syncRoundsWithPythonBackend": "On startup retry pending data, seed an empty server, or load server history.",
    "deleteCompletedRound": "Find the requested ID, ask for confirmation, remove it, and redraw.",
    "showEditCompletedRound": "Build a temporary per-hole edit dialog for the selected completed card.",
    "createEditNumberInput": "Create an accessible numeric input with a label and minimum value.",
    "saveEditedCompletedRound": "Validate edited rows, recalculate totals, add editedAt, and save the replacement.",
    "calculateCompletedRoundTotals": "Add scores, par, putts, penalties, and fairways for the edited hole list.",
    "showRoundHistory": "Switch the visible screen to history and render its cards.",
    "showSetup": "Return Home and refresh course actions, resume status, and dashboard.",
    "showStatistics": "Switch to the statistics screen and begin rendering its current career.",
    "renderStatistics": "Ask Python for grouped statistics when enabled; fall back locally and reject stale results.",
    "renderHomeDashboard": "Show local career summary, latest all-history round, and favorite shortcuts.",
    "formatDateOnly": "Format a valid date in the user's locale without its time.",
    "calculateHandicapEstimate": "Offline version of the recent-differential selection and initial adjustment table.",
    "calculateEstimatedDifferential": "Offline version of the rated-18 formula or par-based approximation.",
    "renderPersonalBests": "Group records by course, tee, and layout; display the lowest score in each group.",
    "calculateStatistics": "Accumulate local averages, round-length groups, hole-type totals, and best round.",
    "renderHoleTypeStatistics": "Display average score and score-to-par for par-3, par-4, and par-5 holes.",
    "renderRecentResults": "Show up to five results; compare oldest/newest only when their lengths match.",
    "formatAverage": "Render a numeric average with one decimal place.",
    "formatGroupedAverage": "Divide each length group's selected total by rounds and add 9H/18H labels.",
    "formatAverageToPar": "Round a score-to-par average and display Even or a signed number.",
    "renderRoundHistory": "Clear and rebuild the history list, count, and empty-state message.",
    "createHistoryCard": "Build one course/date/summary card with scorecard, edit, and delete controls.",
    "createStat": "Build a small label/value element for a summary statistic.",
    "createScorecard": "Build the hole table with scores, putts, fairways, and penalties.",
    "formatRoundDate": "Display a completed round's date and time in the user's locale.",
    "formatScoreToPar": "Display zero as Even, positive scores with +, and negative scores normally.",
    "formatFairway": "Translate stored fairway codes into readable display text.",
    "updateCurrentScore": "Add completed/entered hole scores and compare them with the corresponding par.",
    "finishRound": "Build and save a complete scorecard, remove the draft, and show the final summary.",
}


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    source = (ROOT / "docs/COMPLETE_GUIDE.md").read_text(encoding="utf-8")
    names = re.findall(r"^(?:async )?function (\w+)\(",
                       (ROOT / "script.js").read_text(encoding="utf-8"), re.M)
    missing = set(names) - FUNCTIONS.keys()
    if missing:
        raise ValueError(f"Missing function explanations: {sorted(missing)}")

    pages = source.split("---PAGE---")
    assert len(pages) == 7, "Update the document map if chapter pages change."
    chapter_count = len(pages)
    for offset in range(0, len(names), 12):
        lines = [f"# Function index {offset // 12 + 1}",
                 "## script.js - search these exact names in your editor"]
        for name in names[offset:offset + 12]:
            lines += [f"### {name}()", FUNCTIONS[name]]
        pages.append("\n\n".join(lines))

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("GuideTitle", fontName="Helvetica-Bold", fontSize=24,
                              leading=29, textColor=colors.HexColor("#14532d"), spaceAfter=15))
    styles.add(ParagraphStyle("GuideSub", fontName="Helvetica-Bold", fontSize=12,
                              leading=16, textColor=colors.HexColor("#14532d"), spaceBefore=10, spaceAfter=8))
    styles.add(ParagraphStyle("GuideBody", fontName="Helvetica", fontSize=11,
                              leading=16, textColor=colors.HexColor("#243640"), spaceAfter=10))
    styles.add(ParagraphStyle("GuideBullet", parent=styles["GuideBody"], leftIndent=12,
                              firstLineIndent=-9, spaceAfter=7))
    styles.add(ParagraphStyle("GuideFunction", fontName="Helvetica-Bold", fontSize=10,
                              leading=13, textColor=colors.HexColor("#14532d"), spaceAfter=2))
    styles.add(ParagraphStyle("GuideIndexBody", parent=styles["GuideBody"], fontSize=9.5,
                              leading=13, spaceAfter=9))
    styles.add(ParagraphStyle("GuideCode", fontName="Courier", fontSize=9,
                              leading=13, backColor=colors.HexColor("#eff5f0"), borderPadding=10,
                              spaceBefore=6, spaceAfter=12))
    styles.add(ParagraphStyle("GuideCallout", parent=styles["GuideBody"],
                              backColor=colors.HexColor("#eff5f0"), borderPadding=10,
                              spaceBefore=8, spaceAfter=14))

    story = []
    titles = []
    for page_index, page in enumerate(pages):
        if page_index:
            story.append(PageBreak())
        titles.append(page.strip().splitlines()[0].lstrip("# "))
        # This small parser supports only the headings, bullets, and code blocks
        # used in our source; it is intentionally not a full Markdown engine.
        chunks = re.split(r"(```[\s\S]*?```)", page.strip())
        for chunk in chunks:
            if chunk.startswith("```"):
                story.append(Preformatted(chunk.strip("`\n"), styles["GuideCode"]))
                continue
            for block in re.split(r"\n\s*\n", chunk.strip()):
                if not block:
                    continue
                if block.startswith("# ") and "\n## " in block:
                    first, rest = block.split("\n", 1)
                    story.append(Paragraph(escape(first[2:]), styles["GuideTitle"]))
                    story.append(Paragraph(escape(rest.lstrip("# ")), styles["GuideSub"]))
                elif block.startswith("### "):
                    story.append(Paragraph(escape(block[4:]), styles["GuideFunction"]))
                elif block.startswith("## "):
                    story.append(Paragraph(escape(block[3:]), styles["GuideSub"]))
                elif block.startswith("# "):
                    story.append(Paragraph(escape(block[2:]), styles["GuideTitle"]))
                elif block.startswith("- "):
                    for bullet in re.split(r"\n- ", block[2:]):
                        story.append(Paragraph("- " + escape(" ".join(bullet.splitlines())), styles["GuideBullet"]))
                else:
                    text = escape(" ".join(block.splitlines()))
                    style = styles["GuideIndexBody"] if page_index >= chapter_count else styles["GuideBody"]
                    if block.startswith(("SAY IT ALOUD:", "TRY IT:", "IMPORTANT:")):
                        style = styles["GuideCallout"]
                    story.append(Paragraph(text, style))

    def decorate(canvas, doc):
        page = doc.page
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#bad3c0"))
        canvas.line(48, 748, 564, 748)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(colors.HexColor("#43604c"))
        canvas.drawString(48, 762, "GOLF ROUND TRACKER  /  DEVELOPER REFERENCE")
        canvas.setFont("Helvetica", 8)
        canvas.drawString(48, 28, "Repository file outline | Architecture and implementation")
        canvas.drawRightString(564, 28, f"{page} / {len(pages)}")
        if page <= len(titles):
            canvas.bookmarkPage(f"page-{page}")
            canvas.addOutlineEntry(titles[page - 1], f"page-{page}", level=0)
        canvas.restoreState()

    doc = SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=48,
                            leftMargin=48, topMargin=62, bottomMargin=52,
                            title="Golf Round Tracker - Developer Reference",
                            author="Golf Round Tracker", pageCompression=1)
    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
    reader = PdfReader(OUTPUT)
    if len(reader.pages) != len(pages):
        raise ValueError(f"Page overflow: expected {len(pages)}, got {len(reader.pages)}")
    for index, title in enumerate(titles):
        if title not in reader.pages[index].extract_text():
            raise ValueError(f"Chapter title missing from page {index + 1}: {title}")
    print(f"Built {len(pages)} pages, covering all {len(names)} script.js functions: {OUTPUT}")


if __name__ == "__main__":
    build()
