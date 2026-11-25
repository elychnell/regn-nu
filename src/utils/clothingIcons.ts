import downJacket from "../assets/icons/downJacket.svg?raw";

const clothingIcons = {
    downJacket
};

type ClothingIconName = keyof typeof clothingIcons;

export function getClothingIcon(
    iconName: ClothingIconName
): string {
    return `
        <span class="clothing-icon">
            ${clothingIcons[iconName]}
        </span>
        `;
}

