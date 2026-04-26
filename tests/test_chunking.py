"""Tests for the SOAP-aware chunker."""

from mcp_server.chunking import (
    TARGET_CHARS,
    chunk_clinical_note,
)


SOAP_NOTE = """\
CHIEF COMPLAINT: Chest pain.

SUBJECTIVE:
The patient is a 65-year-old male with a history of hypertension and
hyperlipidemia who presents to the emergency department with substernal
chest pain that began approximately two hours prior to arrival.

OBJECTIVE:
Vital signs: BP 152/88, HR 92, RR 18, T 98.6 F, SpO2 97% on room air.
Physical exam: Lungs clear bilaterally. Heart regular rate and rhythm,
no murmurs, rubs, or gallops. Abdomen soft, non-tender, non-distended.

ASSESSMENT:
1. Acute chest pain, rule out acute coronary syndrome.
2. Hypertension, currently uncontrolled.
3. Hyperlipidemia, on statin therapy.

PLAN:
1. Admit to telemetry for serial cardiac enzymes and ECGs.
2. Aspirin 325 mg PO once.
3. Cardiology consultation in the morning.
4. Continue home medications.
"""


# Build a long non-SOAP note that definitely exceeds TARGET_CHARS.
NON_SOAP_NOTE = (
    "The patient was seen in clinic today for a routine follow-up visit. "
    "She reports feeling well overall with no acute complaints. Her medications "
    "have been tolerated without significant side effects. Blood pressure "
    "readings at home have been stable. " * 50
)


def test_soap_note_tags_all_four_sections():
    chunks = chunk_clinical_note(SOAP_NOTE)
    sections = [c.soap_section for c in chunks if c.soap_section]
    assert "SUBJECTIVE" in sections
    assert "OBJECTIVE" in sections
    assert "ASSESSMENT" in sections
    assert "PLAN" in sections


def test_soap_note_each_section_in_its_own_chunk():
    chunks = chunk_clinical_note(SOAP_NOTE)
    soap_chunks = [c for c in chunks if c.soap_section]
    # Sections in this fixture are well under TARGET_CHARS, so they should
    # each end up as one chunk rather than being further sub-split.
    assert len(soap_chunks) == 4


def test_soap_preamble_is_untagged():
    chunks = chunk_clinical_note(SOAP_NOTE)
    # "CHIEF COMPLAINT: Chest pain." appears before the first SOAP marker.
    preamble = [c for c in chunks if c.soap_section is None]
    assert preamble, "preamble before SUBJECTIVE should produce an untagged chunk"
    assert "CHIEF COMPLAINT" in preamble[0].text


def test_non_soap_note_has_no_section_tags():
    chunks = chunk_clinical_note(NON_SOAP_NOTE)
    assert chunks
    assert all(c.soap_section is None for c in chunks)


def test_non_soap_long_note_splits_into_multiple_chunks():
    chunks = chunk_clinical_note(NON_SOAP_NOTE)
    assert len(chunks) >= 2


def test_non_soap_chunks_respect_target_size():
    chunks = chunk_clinical_note(NON_SOAP_NOTE)
    # Allow some slack — paragraph boundaries can push us slightly past target.
    assert all(len(c.text) <= TARGET_CHARS * 1.5 for c in chunks)


def test_short_note_returns_single_chunk():
    chunks = chunk_clinical_note("Brief note. Patient stable.")
    assert len(chunks) == 1
    assert chunks[0].soap_section is None


def test_empty_input_returns_empty_list():
    assert chunk_clinical_note("") == []
    assert chunk_clinical_note("   \n\n  ") == []


def test_single_soap_marker_does_not_trigger_soap_path():
    # Only one section header — should fall through to recursive split,
    # not be treated as a SOAP-structured note.
    text = "PLAN:\n1. Continue current therapy. 2. Follow up in two weeks."
    chunks = chunk_clinical_note(text)
    assert all(c.soap_section is None for c in chunks)


def test_assessment_and_plan_collapses_to_assessment():
    text = (
        "SUBJECTIVE:\nPatient reports headache.\n\n"
        "OBJECTIVE:\nVitals stable.\n\n"
        "ASSESSMENT AND PLAN:\nTension headache, recommend OTC analgesics."
    )
    chunks = chunk_clinical_note(text)
    sections = {c.soap_section for c in chunks if c.soap_section}
    assert "ASSESSMENT" in sections
    assert "PLAN" not in sections  # collapsed
