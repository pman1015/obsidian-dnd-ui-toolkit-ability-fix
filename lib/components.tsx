import { AbilityBlock, AbilityModifier, AbilityScores } from "./types";
import { StatGrid } from "./components/stat-cards";

export function AbilityView(data: AbilityBlock) {
	const { abilities, modifiers } = data;
	const { strength, dexterity, constitution, intelligence, wisdom, charisma } = abilities;

	const abbreviate = (name: string) => {
		return name.substring(0, 3).toUpperCase();
	}

	// Calculate ability modifier according to D&D 5e rules
	const calculateModifier = (score: number): number => {
		return Math.floor((score - 10) / 2);
	}

	// Format the modifier with + or - sign
	const formatModifier = (modifier: number): string => {
		return modifier >= 0 ? `+${modifier}` : `${modifier}`;
	}

	// Get modifiers for a specific ability
	const getModifiersForAbility = (ability: keyof AbilityScores): AbilityModifier[] => {
		return modifiers.filter(mod => mod.target === ability);
	}

	// Calculate total score including modifiers
	const getTotalScore = (baseScore: number, ability: keyof AbilityScores): number => {
		const abilityModifiers = getModifiersForAbility(ability);
		const modifierTotal = abilityModifiers.reduce((sum, mod) => sum + mod.value, 0);
		return baseScore + modifierTotal;
	}

	const items = [
		{
			name: "Strength",
			baseValue: strength,
			totalValue: getTotalScore(strength, "strength"),
			modifiers: getModifiersForAbility("strength")
		},
		{
			name: "Dexterity",
			baseValue: dexterity,
			totalValue: getTotalScore(dexterity, "dexterity"),
			modifiers: getModifiersForAbility("dexterity")
		},
		{
			name: "Constitution",
			baseValue: constitution,
			totalValue: getTotalScore(constitution, "constitution"),
			modifiers: getModifiersForAbility("constitution")
		},
		{
			name: "Intelligence",
			baseValue: intelligence,
			totalValue: getTotalScore(intelligence, "intelligence"),
			modifiers: getModifiersForAbility("intelligence")
		},
		{
			name: "Wisdom",
			baseValue: wisdom,
			totalValue: getTotalScore(wisdom, "wisdom"),
			modifiers: getModifiersForAbility("wisdom")
		},
		{
			name: "Charisma",
			baseValue: charisma,
			totalValue: getTotalScore(charisma, "charisma"),
			modifiers: getModifiersForAbility("charisma")
		},
	];

	return (
		<div>
			<StatGrid cols={6}>
				{items.map((item) => (
					<div className="ability-score-card" key={item.name}>
						<div className="ability-header">
							<p className="ability-name">{abbreviate(item.name)}</p>
							<p className="ability-value">{item.totalValue}</p>
						</div>
						<p className="ability-modifier">
							{formatModifier(calculateModifier(item.totalValue))}
						</p>
					</div>
				))}
			</StatGrid>
		</div>
	)
}
