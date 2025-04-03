import { AbilityBlock, AbilityModifier, AbilityScores, SavingThrowsBlock, StatsBlock } from "./types";

export function SavingThrowsView(data: SavingThrowsBlock) {
	const { proficiencyBonus, abilityScores, proficiencies, bonuses = {} } = data;

	// Calculate ability modifier according to D&D 5e rules
	const calculateModifier = (score: number): number => {
		return Math.floor((score - 10) / 2);
	};

	// Format the modifier with + or - sign
	const formatModifier = (modifier: number): string => {
		return modifier >= 0 ? `+${modifier}` : `${modifier}`;
	};

	// Calculate saving throw value
	const calculateSavingThrow = (ability: keyof AbilityScores): number => {
		// Base ability modifier
		const abilityScore = abilityScores[ability];
		const abilityMod = calculateModifier(abilityScore);

		// Add proficiency bonus if proficient
		const isProficient = proficiencies.includes(ability);
		const profBonus = isProficient ? proficiencyBonus : 0;

		// Add any custom bonuses
		// @ts-ignore
		const customBonus = bonuses[ability] || 0;

		return abilityMod + profBonus + customBonus;
	};

	const getAbilityFullName = (ability: keyof AbilityScores): string => {
		const names: Record<keyof AbilityScores, string> = {
			strength: "Strength",
			dexterity: "Dexterity",
			constitution: "Constitution",
			intelligence: "Intelligence",
			wisdom: "Wisdom",
			charisma: "Charisma"
		};
		return names[ability];
	};

	const savingThrows = Object.keys(abilityScores).map(ability => {
		const abilityKey = ability as keyof AbilityScores;
		const value = calculateSavingThrow(abilityKey);
		const isProficient = proficiencies.includes(abilityKey);

		return {
			ability: abilityKey,
			name: getAbilityFullName(abilityKey),
			value: formatModifier(value),
			proficient: isProficient,

			// @ts-ignore
			bonus: bonuses[abilityKey] || 0
		};
	});

	return (
		<div>
			<h3 className="saving-throws-header">Saving Throws</h3>
			<div className="saving-throws-grid">
				{savingThrows.map((save) => (
					<div className={`saving-throw-item ${save.proficient ? 'proficient' : ''}`} key={save.ability}>
						<div className="saving-throw-ability">{save.name}</div>
						<div className="saving-throw-value">{save.value}</div>
						{save.bonus !== 0 && (
							<div className="saving-throw-bonus">({save.bonus > 0 ? '+' : ''}{save.bonus})</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export function StatsView(data: StatsBlock) {
	const { items, grid } = data;
	const columns = grid?.columns || 3;

	return (
		<div>
			<div className="stats-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
				{items.map((item, index) => (
					<div className="stat-card" key={index}>
						<div className="stat-name">{item.name}</div>
						<div className="stat-value">{item.value}</div>
					</div>
				))}
			</div>
		</div>
	);
}

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
			<div className="ability-scores-grid">
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
			</div>
		</div>
	)
}
