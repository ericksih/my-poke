import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";

const Pokemons = () => {
  const router = useRouter();
  const [pokemons, setPokemons] = useState<{ name: string; url: string }[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<
    { name: string; url: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const itemsPerPage = 8;

  useEffect(() => {
    fetchPokemons(first);
  }, [first]);

  const fetchPokemons = async (offset = 0, searchTerm = "") => {
    setLoading(true);
    try {
      if (searchTerm) {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${searchTerm}`
        );
        if (response.ok) {
          const data = await response.json();
          setPokemons([data]);
          setFilteredPokemons([data]);
          setTotalRecords(1);
        } else {
          setPokemons([]);
          setFilteredPokemons([]);
          setTotalRecords(0);
          console.error("Pokémon not found");
        }
      } else {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`
        );
        const data = await response.json();
        setPokemons(data.results);
        setFilteredPokemons(data.results);
        setTotalRecords(data.count);
      }
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    const query = event.target.value as string;
    setSearchTerm(query);
    setFirst(0);

    if (query) {
      fetchPokemons(0, query); // Fetch by name
    } else {
      fetchPokemons(0);
    }
  };

  // Handle sorting
  const handleSort = (event: { target: { value: any } }) => {
    const order = event.target.value;
    setSortOrder(order);
    const sortedPokemons = [...filteredPokemons].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (order === "asc") return nameA.localeCompare(nameB);
      else return nameB.localeCompare(nameA);
    });
    setFilteredPokemons(sortedPokemons);
  };

  // Handle page changes
  const onPageChange = (event: {
    first: React.SetStateAction<number> | undefined;
  }) => {
    if (event.first !== undefined) {
      setFirst(event.first);
    }
    if (typeof event.first === "number") {
      fetchPokemons(event.first);
    }
  };

  const getPokemonId = (url: string) => {
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 2];
  };

  const getPokemonImageUrl = (id: number | string) => {
    const paddedId = String(id).padStart(3, "0");
    return `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${paddedId}.png`;
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Pokémon List</h1>

      {/* Search input field */}
      <div className="mb-4 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search by Pokémon name..."
          value={searchTerm}
          onChange={handleSearch}
        />

        {/* Sort dropdown */}
        <select className="form-select" value={sortOrder} onChange={handleSort}>
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select>
      </div>

      <div className="row">
        {loading ? (
          <ProgressSpinner />
        ) : filteredPokemons.length === 0 && !loading ? (
          <p className="text-center">No Pokémon found</p>
        ) : (
          filteredPokemons?.map(
            (pokemon: {
              name: string;
              url: string;
              id?: number;
              sprites?: { front_default: string };
            }) => {
              const id = pokemon.id || getPokemonId(pokemon.url);
              return (
                <div
                  key={pokemon.name || pokemon.id}
                  className="col-12 col-md-6 col-lg-3 mb-4"
                >
                  <div className="card text-center shadow-sm">
                    <img
                      src={
                        pokemon.sprites?.front_default || getPokemonImageUrl(id)
                      }
                      alt={pokemon.name}
                      className="card-img-top"
                    />
                    <div className="card-body">
                      <h5 className="card-title text-capitalize">
                        {pokemon.name}
                      </h5>
                      <Button
                        label="View Details"
                        icon="pi pi-info-circle"
                        onClick={() => router.push(`/pokemon/${id}`)}
                        className="p-button-rounded p-button-info mt-2"
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      <Paginator
        first={first}
        rows={itemsPerPage}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        className="mt-4 justify-content-center"
      />
    </div>
  );
};

export default Pokemons;
