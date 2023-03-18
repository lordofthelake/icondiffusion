import {
  Center,
  Container,
  Loader,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

export default function Page() {
  return (
    <Container>
      <Center>
        <Stack spacing="xl">
          <Title>icondiffusion</Title>
          <TextInput
            size="xl"
            placeholder="Your prompt"
            radius="xl"
            rightSection={<Loader size="lg" />}
          />
        </Stack>
      </Center>
    </Container>
  );
}
