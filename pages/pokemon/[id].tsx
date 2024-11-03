import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Knob } from "primereact/knob";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Tag } from "primereact/tag";

const PokeDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [pokemon, setPokemon] = useState<{
    name: string;
    sprites: {
      front_default: string;
      other: { "official-artwork": { front_default: string } };
    };
    height: number;
    weight: number;
    abilities: { ability: { name: string } }[];
    types: { type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    base_experience: number;
    moves: { move: { name: string } }[];
  } | null>(null);

  console.group(pokemon, "..");

  const [loading, setLoading] = useState(true);

  // Fetch Pokémon data by ID
  useEffect(() => {
    if (id) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPokemon(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching Pokémon data:", error);
          setLoading(false);
        });
    }
  }, [id]);

  // Show loading spinner first if loading is true
  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  if (!pokemon) return <p>Pokémon not found.</p>;

  return (
    <div className="container">
      <Button
        onClick={() => router.back()}
        className="p-button-secondary mt-3 ms-2"
      >
        Go Back
      </Button>
      <Card title={pokemon.name} className="m-2 text-center">
        <img
          src={
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default
          }
          alt={pokemon.name}
          style={{ width: "300px", height: "300px" }}
        />

        <div className="mt-2 d-flex flex-column gap-1">
          <Tag severity="success">
            <strong>Base Experience:</strong> {pokemon.base_experience}
          </Tag>
          <Tag severity="info">
            <strong>Height:</strong> {pokemon.height}
          </Tag>
          <Tag severity="warning">
            <strong>Weight:</strong> {pokemon.weight}
          </Tag>
        </div>
      </Card>

      <TabView>
        <TabPanel header="Types">
          <ul>
            {pokemon.types.map((type, index) => (
              <li key={index} className="text-capitalize">
                {type.type.name}
              </li>
            ))}
          </ul>
        </TabPanel>
        <TabPanel header="Stats">
          <ul className="d-flex flex-wrap justify-content-center m-2">
            {pokemon.stats.map((stat, index) => (
              <li
                key={index}
                style={{
                  margin: "1rem",
                  listStyle: "none",
                  textAlign: "center",
                }}
              >
                <strong className="text-capitalize">{stat.stat.name}:</strong>{" "}
                <Knob
                  value={stat.base_stat}
                  size={100}
                  readOnly
                  strokeWidth={20}
                  max={200}
                  min={0}
                  step={1}
                  valueColor={stat.base_stat < 70 ? "#FF5252" : "#4CAF50"}
                />
              </li>
            ))}
          </ul>
        </TabPanel>
        <TabPanel header="Abilities">
          <ul>
            {pokemon.abilities.map((ability, index) => (
              <li key={index} className="text-capitalize">
                {ability.ability.name}
              </li>
            ))}
          </ul>
        </TabPanel>
      </TabView>

      <Card title="Moves" className="m-2">
        <ul
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            listStyleType: "none",
            padding: 0,
          }}
        >
          {pokemon.moves.slice(0, 10).map((move, index) => (
            <li key={index} className="text-capitalize">
              {move.move.name}
            </li>
          ))}
        </ul>
        <p>
          <em>Showing first 10 moves</em>
        </p>
      </Card>
    </div>
  );
};

export default PokeDetail;
