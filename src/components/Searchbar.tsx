import React from "react";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router";

interface SearchBarProps {
  isLoading: boolean;
}

export function SearchBar({ isLoading }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = React.useState("");
  const changeSearchBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleClickAccount = (account: string) => {
    navigate(`/leaderboard/${account}`);
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    handleClickAccount(searchInput.trim());
  };

  return (
    <form
      onSubmit={handleSearchClick}
      className={`sm:mx-0 opacity-0 ${!isLoading ? "fade-in" : ""}`}
    >
      <label className="input py-0 input-sm flex items-center gap-2 my-3 ">
        <input
          type="text"
          className="grow sm:w-[250px] lg:focus:w-[400px]"
          placeholder="Search"
          value={searchInput}
          onChange={changeSearchBox}
        />
        <button className="" onClick={handleSearchClick}>
          <CiSearch />
        </button>
      </label>
    </form>
  );
}
