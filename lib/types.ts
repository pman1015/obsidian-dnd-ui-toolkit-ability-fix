export type AbilityBlock = {
	abilities: AbilityScores;
	modifiers: AbilityModifier[];
}

export type AbilityScores = {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
}

// An AbilityModifier is an additional property for the ability block
// that allows for custom additions to score points. This helps users
// add things from feats, or other sources that might modify the score.
export type AbilityModifier = {
	name: string;
	target: keyof AbilityScores;
	value: number;
}

export type StatItem = {
	name: string;
	value: string | number;
}

export type StatsBlock = {
	items: StatItem[];
	grid?: {
		columns?: number;
	};
}

export type SavingThrow = {
	ability: keyof AbilityScores;
	proficient: boolean;
	bonus: number;
}

export type SavingThrowsBlock = {
	proficiencyBonus: number;
	abilityScores: AbilityScores;
	proficiencies: Array<keyof AbilityScores>;
	bonuses?: Record<keyof AbilityScores, number>;
}
