import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image
)

def add_page_number(canvas, doc):
    canvas.saveState()

    page_number = canvas.getPageNumber()

    canvas.setFont("Helvetica", 8)

    canvas.drawCentredString(
        A4[0] / 2,
        10 * mm,
        f"Page {page_number}"
    )

    canvas.drawString(
        20 * mm,
        10 * mm,
        "Vendor Reliability Intelligence Platform"
    )

    canvas.restoreState()

def create_chart(chart_type, data, title):
    buffer = BytesIO()

    labels = list(data.keys())
    values = list(data.values())

    plt.figure(figsize=(6, 3.5))

    if chart_type == "bar":
        plt.bar(labels, values)
        plt.ylabel("Count")

    elif chart_type == "line":
        plt.plot(labels, values, marker="o")
        plt.ylabel("Amount")

    plt.title(title)
    plt.xticks(rotation=30)
    plt.tight_layout()

    plt.savefig(
        buffer,
        format="png",
        dpi=150
    )

    plt.close()

    buffer.seek(0)

    return buffer

def format_value(value, key=""):

    if value is None:
        return "-"

    key_lower = key.lower()

    # Currency
    if any(
        word in key_lower
        for word in [
            "value",
            "amount",
            "cost",
            "spending",
            "price"
        ]
    ):
        if isinstance(value, (int, float)):
            return f"₹{value:,.2f}"

    # Percentage
    if (
        "percentage" in key_lower
        or "rate" in key_lower
        or "score" in key_lower
    ):
        if isinstance(value, (int, float)):
            return f"{value:.2f}"

    return str(value)


def apply_table_style(table):

    table.setStyle(
        TableStyle([
            # Header
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#1F4E78")
            ),

            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white
            ),

            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold"
            ),

            # Grid
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.35,
                colors.HexColor("#C7D0D9")
            ),

            # Alternating rows
            (
                "ROWBACKGROUNDS",
                (0, 1),
                (-1, -1),
                [
                    colors.white,
                    colors.HexColor("#F4F7FA")
                ]
            ),

            # Spacing
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

            # Alignment
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            )
        ])
    )
    
def generate_pdf(
    report_title: str,
    report_data: dict,
    filters: dict = None
):

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=12 * mm,
        leftMargin=12 * mm,
        topMargin=18 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        leading=24,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["BodyText"],
        alignment=TA_CENTER,
        fontSize=9,
        textColor=colors.grey,
        spaceAfter=14
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        spaceBefore=12,
        spaceAfter=7
    )

    cell_style = ParagraphStyle(
        "Cell",
        parent=styles["BodyText"],
        fontSize=8,
        leading=10,
        spaceAfter=0
    )

    header_style = ParagraphStyle(
        "Header",
        parent=cell_style,
        fontName="Helvetica-Bold",
        textColor=colors.white,
        alignment=TA_CENTER
    )

    elements = []

    # ---------------------------------------
    # REPORT HEADER
    # ---------------------------------------

    elements.append(
        Paragraph(
            report_title,
            title_style
        )
    )

    generated_at = datetime.now().strftime(
        "%d %b %Y, %I:%M %p"
    )

    elements.append(
        Paragraph(
            f"Generated on {generated_at}",
            subtitle_style
        )
    )

    # ---------------------------------------
    # APPLIED FILTERS
    # ---------------------------------------

    active_filters = {}

    if filters:
        for key, value in filters.items():
            if value is not None and value != "":
                active_filters[key] = value

    if active_filters:

        elements.append(
            Paragraph(
                "Applied Filters",
                heading_style
            )
        )

        filter_rows = [
            [
                Paragraph("Filter", header_style),
                Paragraph("Value", header_style)
            ]
        ]

        for key, value in active_filters.items():

            filter_rows.append([
                Paragraph(
                    key.replace("_", " ").title(),
                    cell_style
                ),
                Paragraph(
                    str(value),
                    cell_style
                )
            ])

        filter_table = Table(
            filter_rows,
            colWidths=[55 * mm, 105 * mm],
            repeatRows=1
        )

        filter_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#1F4E78")
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.HexColor("#B7C3D0")
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        colors.HexColor("#F5F8FC")
                    ]
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ])
        )

        elements.append(filter_table)
        elements.append(Spacer(1, 8))

    # ---------------------------------------
    # REPORT SECTIONS
    # ---------------------------------------

    for section_name, section_data in report_data.items():

        if section_name == "report_type":
            continue

        elements.append(
            Paragraph(
                section_name.replace(
                    "_", " "
                ).title(),
                heading_style
            )
        )

        # =====================================
        # DICTIONARY
        # =====================================

        if isinstance(section_data, dict):

            rows = [
                [
                    Paragraph("Metric", header_style),
                    Paragraph("Value", header_style)
                ]
            ]

            for key, value in section_data.items():

                display_key = key.replace(
                    "_", " "
                ).title()

                # Nested dictionary
                if isinstance(value, dict):

                    rows.append([
                        Paragraph(
                            display_key,
                            cell_style
                        ),
                        Paragraph(
                            "",
                            cell_style
                        )
                    ])

                    for nested_key, nested_value in value.items():

                        rows.append([
                            Paragraph(
                                f"&nbsp;&nbsp;{nested_key.replace('_', ' ').title()}",
                                cell_style
                            ),
                            Paragraph(
                                format_value(
                                    nested_value,
                                    nested_key
                                ),
                                cell_style
                            )
                        ])

                else:

                    rows.append([
                        Paragraph(
                            display_key,
                            cell_style
                        ),
                        Paragraph(
                            format_value(value, key),
                            cell_style
                        )
                    ])

            table = Table(
                rows,
                colWidths=[70 * mm, 90 * mm],
                repeatRows=1
            )

            apply_table_style(table)

            elements.append(table)

        # =====================================
        # LIST OF RECORDS
        # =====================================

        elif isinstance(section_data, list):

            if not section_data:
                elements.append(
                    Paragraph(
                        "No records available.",
                        cell_style
                    )
                )

            else:

                first_item = section_data[0]

                if isinstance(first_item, dict):

                    keys = list(first_item.keys())

                    rows = [[
                        Paragraph(
                            key.replace(
                                "_", " "
                            ).title(),
                            header_style
                        )
                        for key in keys
                    ]]

                    for item in section_data:

                        row = []

                        for key in keys:

                            value = item.get(
                                key,
                                ""
                            )

                            row.append(
                                Paragraph(
                                    format_value(
                                        value,
                                        key
                                    ),
                                    cell_style
                                )
                            )

                        rows.append(row)

                    # Let ReportLab distribute columns.
                    table = Table(
                        rows,
                        repeatRows=1,
                        hAlign="LEFT"
                    )

                    apply_table_style(table)

                    elements.append(table)

                else:

                    for item in section_data:

                        elements.append(
                            Paragraph(
                                str(item),
                                cell_style
                            )
                        )

        else:

            elements.append(
                Paragraph(
                    format_value(
                        section_data,
                        section_name
                    ),
                    cell_style
                )
            )

        elements.append(
            Spacer(1, 8)
        )

    # ---------------------------------------
    # CHARTS
    # ---------------------------------------

    reliability_data = report_data.get(
        "vendor_reliability_distribution"
    )

    if isinstance(reliability_data, dict):

        elements.append(
            Paragraph(
                "Vendor Reliability Distribution",
                heading_style
            )
        )

        chart_buffer = create_chart(
            "bar",
            reliability_data,
            "Vendor Reliability Distribution"
        )

        elements.append(
            Image(
                chart_buffer,
                width=155 * mm,
                height=82 * mm
            )
        )

        elements.append(
            Spacer(1, 8)
        )

    monthly_data = report_data.get(
        "monthly_procurement_trends"
    )

    if isinstance(monthly_data, dict):

        spending_data = {
            month: values.get(
                "spending",
                0
            )
            for month, values in monthly_data.items()
            if isinstance(values, dict)
        }

        if spending_data:

            elements.append(
                Paragraph(
                    "Monthly Procurement Spending",
                    heading_style
                )
            )

            chart_buffer = create_chart(
                "line",
                spending_data,
                "Monthly Procurement Spending"
            )

            elements.append(
                Image(
                    chart_buffer,
                    width=155 * mm,
                    height=82 * mm
                )
            )

    # ---------------------------------------
    # BUILD PDF
    # ---------------------------------------

    document.build(
        elements,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number
    )

    buffer.seek(0)

    return buffer
