#!/usr/bin/env python3
"""Generate a timeline diagram for project iterations."""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# Set up the figure
fig, ax = plt.subplots(figsize=(14, 4))

# Define iterations
iterations = [
    {"name": "Iteracja 1\nPOC", "color": "#E3F2FD", "border": "#1976D2", "weeks": "Tydzień 1-2"},
    {"name": "Iteracja 2\nDesign", "color": "#E8F5E9", "border": "#388E3C", "weeks": "Tydzień 3-4"},
    {"name": "Iteracja 3\nMVP", "color": "#FFF3E0", "border": "#F57C00", "weeks": "Tydzień 5-8"},
    {"name": "Iteracja 4\nDeploy", "color": "#FCE4EC", "border": "#C2185B", "weeks": "Tydzień 9-10"},
]

# Box dimensions
box_width = 2.5
box_height = 1.8
spacing = 0.8
y_center = 1.5

# Draw boxes and arrows
for i, iteration in enumerate(iterations):
    x = i * (box_width + spacing) + 1
    
    # Draw the box
    box = FancyBboxPatch(
        (x, y_center - box_height/2),
        box_width,
        box_height,
        boxstyle="round,pad=0.05,rounding_size=0.2",
        facecolor=iteration["color"],
        edgecolor=iteration["border"],
        linewidth=2.5
    )
    ax.add_patch(box)
    
    # Add iteration name
    ax.text(
        x + box_width/2,
        y_center + 0.15,
        iteration["name"],
        ha='center',
        va='center',
        fontsize=11,
        fontweight='bold',
        color='#333333'
    )
    
    # Add weeks below
    ax.text(
        x + box_width/2,
        y_center - 0.55,
        iteration["weeks"],
        ha='center',
        va='center',
        fontsize=9,
        color='#666666',
        style='italic'
    )
    
    # Draw arrow to next box
    if i < len(iterations) - 1:
        arrow = FancyArrowPatch(
            (x + box_width + 0.05, y_center),
            (x + box_width + spacing - 0.05, y_center),
            arrowstyle='-|>',
            mutation_scale=20,
            color='#666666',
            linewidth=2
        )
        ax.add_patch(arrow)

# Set axis properties
ax.set_xlim(0, len(iterations) * (box_width + spacing) + 0.5)
ax.set_ylim(0, 3)
ax.set_aspect('equal')
ax.axis('off')

# Add title
ax.text(
    (len(iterations) * (box_width + spacing)) / 2 + 0.5,
    2.7,
    'Przebieg projektu w iteracjach',
    ha='center',
    va='center',
    fontsize=14,
    fontweight='bold',
    color='#333333'
)

# Save the figure
plt.tight_layout()
plt.savefig('iteration_timeline.pdf', format='pdf', bbox_inches='tight', dpi=300)
plt.savefig('iteration_timeline.png', format='png', bbox_inches='tight', dpi=300)
print("Saved: iteration_timeline.pdf and iteration_timeline.png")
